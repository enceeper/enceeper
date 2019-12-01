//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Main window of the password manager functionality
//
// Copyright (C) 2019 Vassilis Poursalidis (poursal@gmail.com)
//
// This program is free software: you can redistribute it and/or modify it under the terms of the
// GNU General Public License as published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
// even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with this program. If
// not, see <https://www.gnu.org/licenses/>.
//

/* global $ */

const helpers = require('../helpers.js')
const uicommon = require('./common.js')
const wrapper = require('../wrapper.js')

function deselectCategories () {
  var categories = document.querySelectorAll('.category_link')

  // Remove 'open' class
  categories.forEach(function (category) {
    category.classList.remove('open')
  })
}

function searchOpenDistance () {
  var x = window.innerWidth

  if (x < 650) {
    return 50
  } else {
    return 100
  }
}

module.exports = {
  searchFocus: function (target) {
    var x = $('#search-close')

    if (x.hasClass('hide')) {
      x.removeClass('hide')

      $('#searchnavfix2').animate({
        width: '+=' + searchOpenDistance(),
        marginRight: 0
      }, 150)
    }
  },

  searchBlur: function (target) {
    var x = $('#search-close')

    if (!x.hasClass('hide')) {
      setTimeout(function () {
        x.addClass('hide')
        $('#searchnavfix2').animate({
          width: '-=' + searchOpenDistance()
        }, 150)
      }, 100)
    }
  },

  search: function (target) {
    // Remove 'open' class
    deselectCategories()

    global.enc.search(target.value, module.exports.refreshKeys)
  },

  clearSearch: function () {
    var selected = document.getElementById('category')
    var name = $(selected).text() // This is required to de-escape HTML
    var categories = document.querySelectorAll('.category_link')

    // Add 'open' class
    categories.forEach(function (category) {
      if ($(category.childNodes[0]).text() === name) {
        category.classList.add('open')
      }
    })

    $('#search').val('')
    module.exports.refreshKeys(global.enc.getKeys(name))
  },

  // Show the main UI
  showMain: function () {
    uicommon.loadTemplate('main')

    // Set the badges
    uicommon.updateBadges()

    // Create height handlers
    global.sidenav = $('#nav-mobile')
    helpers.fixSidenav()

    // Prepare the sidenav
    $('.sidenav').sidenav()
    // Prepare the dropdown menu
    helpers.enableDropdowns('.dropdown-trigger')

    // Populate categories
    module.exports.populateCategories()

    helpers.swapUIElements(
      document.getElementById('intro'),
      document.getElementById('main'),
      function () {
        uicommon.closeSpinner()
      }
    )
  },

  populateCategories: function () {
    var categories = global.enc.getCategories()
    var sideNav = document.getElementById('nav-mobile')
    var selected = document.getElementById('category')
    var selectedValue = $(selected).text() // This is required to de-escape HTML
    var hasSelected = false
    var sideNavHTML = ''

    categories.forEach(function (category) {
      var categoryEntry = global.categoryEntry.replace('%CATEGORY_NAME%', helpers.escapeHtml(category))

      if (selectedValue === category) {
        hasSelected = true
        categoryEntry = categoryEntry.replace('%SELECTED%', ' open')
      } else {
        categoryEntry = categoryEntry.replace('%SELECTED%', '')
      }

      sideNavHTML = sideNavHTML + categoryEntry
    })
    sideNav.innerHTML = sideNavHTML

    // If no categories reset breadcrumb
    if (categories.length === 0) {
      selected.innerHTML = ''
    }

    // If no selection select first
    if (categories.length > 0 && !hasSelected) {
      module.exports.selectCategory(document.querySelector('.category_link').childNodes[0])
    }
  },

  // -- Block to show the key listing
  populateKeys: function (keys) {
    var tableEnties = document.getElementById('tableEnties')
    var allKeys = ''
    var errorFound = false

    // Sort the keys
    keys.sort(wrapper.keysAlphaSort)

    keys.forEach(function (key) {
      if (!wrapper.canHandleMeta(key.meta)) {
        uicommon.showErrorMessage('Failed while processing an entry in your vault.')
        errorFound = true
        return
      }

      allKeys += module.exports.prepareKeyEntry(key)
    })
    // Set the populated key array
    tableEnties.innerHTML = allKeys
    // Now scroll to top
    global.mainWindow.scrollTop(0)

    if (errorFound) {
      uicommon.showErrorMessage('Please update the app to a newer version!')
    }

    // Enable UI elements
    $('.tooltipped2').tooltip()
    $('.collapsible').collapsible()
    helpers.enableDropdowns('.dropdown-trigger2')
  },

  prepareKeyEntry: function (key) {
    var allSlots = ''
    var mineActions1 = 'hide '
    var mineActions2 = 'hide '
    var sharedActions = ''
    var keyDetails

    if (!key.shared) {
      if (key.slots.length !== 1) {
        mineActions1 = ''
      }
      mineActions2 = ''
      sharedActions = 'hide '

      key.slots.forEach(function (slot) {
        if (slot.slot_id === -1) {
          return
        }
        allSlots += module.exports.prepareSlotEntry(key.key_id, slot)
      })
    }

    keyDetails = wrapper.getMetaDetails(key.meta)

    // We are ready return the key
    return global.keyEntry.replace(new RegExp('%ID%', 'g'), key.key_id)
      .replace('%checked%', (key.status === 0) ? 'checked="checked"' : '')
      .replace(new RegExp('%disabled%', 'g'), key.shared ? 'disabled="disabled"' : '')
      .replace('%USERNAME%', helpers.escapeHtml(keyDetails.username))
      .replace('%TITLE%', module.exports.prepareKeyTitle(keyDetails))
      .replace('%NOTES%', helpers.escapeHtml(keyDetails.notes))
      .replace(new RegExp('%MINE_ACTIONS1%', 'g'), mineActions1)
      .replace(new RegExp('%MINE_ACTIONS2%', 'g'), mineActions2)
      .replace(new RegExp('%SHARED_ACTIONS%', 'g'), sharedActions)
      .replace('%SLOT_CONTENTS%', allSlots)
  },

  prepareKeyTitle: function (keyDetails) {
    var title

    // Link or plain text
    if (keyDetails.url.length > 0) {
      var actualUrl = keyDetails.url.replace(/'/g, '\\\'').replace(/"/g, '\\&quot;')

      title = '<a class="text-overflow" href="javascript:;" onClick="app.openLink(\'' + actualUrl + '\')">' + helpers.escapeHtml(keyDetails.title) + '</a>'
      title += '<span class="text-overflow" style="font-size: 10px;">' + helpers.escapeHtml(keyDetails.url) + '</span>'
    } else {
      title = '<span class="text-overflow" style="padding-top: 15px; padding-bottom: 15px;">' + helpers.escapeHtml(keyDetails.title) + '</span>'
    }

    return title
  },

  // Prepare slot entry from template
  prepareSlotEntry: function (keyId, slot) {
    var elemDisabled = ''
    var elemHidden = ''
    var elemTooltip = ''
    var shareTooltip = ''
    var notif

    if (slot.shared) {
      elemDisabled = 'disabled="disabled"'
      elemHidden = 'hide'
      elemTooltip = 'tooltipped2'
      shareTooltip = 'data-position="left" data-tooltip="Shared with ' + slot.with + '"'
    }

    notif = uicommon.decodeNotif(slot.notify)
    return global.slotEntry.replace(new RegExp('%ID%', 'g'), slot.slot_id)
      .replace(new RegExp('%KEY_ID%', 'g'), keyId)
      .replace('%checked%', (slot.status === 0) ? 'checked="checked"' : '')
      .replace('%NOTIF_TOOLTIP%', notif.text)
      .replace('%NOTIF_ICON%', notif.icon)
      .replace('%NOTIF_VALUE%', slot.notify)
      .replace(new RegExp('%disabled%', 'g'), elemDisabled)
      .replace('%ELEM_TOOLTIP%', elemTooltip)
      .replace('%share_tooltip%', shareTooltip)
      .replace(new RegExp('%ELEM_HIDDEN%', 'g'), elemHidden)
  },
  // --

  // Used by: periodic update and key creation (key add, share accept)
  updateKeys: function () {
    var category = document.getElementById('category')
    var search = document.getElementById('search')

    if (search.value.length > 0) {
      global.enc.search(search.value, module.exports.refreshKeys)
    } else {
      // The $().text() is required to de-escape HTML
      module.exports.refreshKeys(global.enc.getKeys($(category).text()))
    }
  },

  selectCategory: function (target) {
    var selected = document.getElementById('category')
    var selectedValue

    // Clear search
    document.getElementById('search').value = ''

    // Clear selectedKeyId
    global.selectedKeyId = -1

    // Prepeare breadcrumb
    selectedValue = $(target).text() // This is required to de-escape HTML
    selected.innerHTML = helpers.escapeHtml(selectedValue)

    // Remove 'open' class
    deselectCategories()

    // Add 'open' class
    target.parentNode.classList.add('open')

    // Finally populate the keys
    module.exports.populateKeys(global.enc.getKeys(selectedValue))
  },

  selectKeyRow: function (event, target) {
    var x = helpers.getNextSibling(target)
    var i = parseInt(target.id.substring(7))

    $('.key-row').removeClass('selected')

    if (global.selectedKeyId !== i || !(event.metaKey || event.ctrlKey)) {
      // Save the selected key Id
      global.selectedKeyId = i

      target.classList.add('selected')
      x.classList.add('selected')
    } else {
      global.selectedKeyId = -1
    }
  },

  // This does the heavy lifting of not refreshing the UI, but updating in place
  refreshKeys: function (keys) {
    var touchedKeys = []
    var touchedSlots = []
    var tableEnties = document.getElementById('tableEnties')
    var errorFound = false

    // Sort the keys
    keys.sort(wrapper.keysAlphaSort)

    keys.forEach(function (key) {
      var keyEntry

      if (!wrapper.canHandleMeta(key.meta)) {
        uicommon.showErrorMessage('Failed while processing an entry in your vault.')
        errorFound = true
        return
      }

      keyEntry = document.getElementById('keyRow_' + key.key_id)
      if (keyEntry === null) {
        // The key is missing, add it!
        if (touchedKeys.length === 0) {
          // We will add the key on top of the other keys
          tableEnties.insertAdjacentHTML('afterbegin', module.exports.prepareKeyEntry(key))
        } else {
          // We will add the key somewhere in the middle (or bottom)
          var existingKey = document.getElementById('keyRow_' + touchedKeys[touchedKeys.length - 1])
          helpers.getNextSibling(existingKey).insertAdjacentHTML('afterend', module.exports.prepareKeyEntry(key))
        }

        touchedKeys.push(key.key_id)

        // Also append all slot ids
        key.slots.forEach(function (slot) {
          touchedSlots.push(slot.slot_id)
        })
      } else {
        var next = helpers.getNextSibling(keyEntry)
        var button = keyEntry.querySelector('.expandButton')
        var place = next.querySelector('.collapsible-body')
        var keyDetails = wrapper.getMetaDetails(key.meta)

        touchedKeys.push(key.key_id)

        // We need to update the contents of the entry
        keyEntry.querySelector('.kselector-title').innerHTML = module.exports.prepareKeyTitle(keyDetails)
        keyEntry.querySelector('.kselector-username').innerHTML = helpers.escapeHtml(keyDetails.username)
        keyEntry.querySelector('.kselector-note').innerHTML = helpers.escapeHtml(keyDetails.notes)
        keyEntry.querySelector('.kselector-status').checked = (key.status === 0)

        // The key exists, check the slots
        key.slots.forEach(function (slot) {
          var slotEntry

          if (slot.slot_id === -1) {
            return
          }

          touchedSlots.push(slot.slot_id)

          slotEntry = document.getElementById('slotRow_' + key.key_id + '_' + slot.slot_id)
          if (slotEntry === null) {
            // The slot is missing, add it!
            place.insertAdjacentHTML('beforeend', module.exports.prepareSlotEntry(key.key_id, slot))
          } else {
            var dec = uicommon.decodeNotif(slot.notify)
            var indicator = slotEntry.querySelector('.sselector-notificon')

            // Update the contents of the slot
            slotEntry.querySelector('.sselector-status').checked = (slot.status === 0)
            slotEntry.querySelector('.sselector-notif').value = slot.notify

            indicator.setAttribute('data-tooltip', dec.text)
            indicator.innerHTML = dec.icon
          }

          button.classList.remove('hide')
        })
      }
    })

    // Now iterate over the table: skip touched values, remove untouched
    // If we remove all the slots remove the button
    tableEnties.querySelectorAll('.key-row-with-slot').forEach(function (item) {
      var keyId = parseInt(item.id.substring(7))
      var next = helpers.getNextSibling(item)
      var button = item.querySelector('.expandButton')
      var slotElems = next.querySelectorAll('.slot-row-entry')
      var slotRemoved = false

      if (touchedKeys.indexOf(keyId) === -1) {
        // Remove key entry
        item.remove()
        next.remove()

        // Reset selectedKeyId
        if (keyId === global.selectedKeyId) {
          global.selectedKeyId = -1
        }

        return
      }

      slotElems.forEach(function (item) {
        var slotId = parseInt(item.id.substring(item.id.lastIndexOf('_') + 1))

        if (touchedSlots.indexOf(slotId) === -1) {
          // Remove slot entry
          item.remove()
          slotRemoved = true
        }
      })

      // Close and remove expand button
      if (slotRemoved && next.querySelectorAll('.slot-row-entry').length === 0) {
        helpers.expandSlots(button, true)
        button.classList.add('hide')
      }
    })

    if (errorFound) {
      uicommon.showErrorMessage('Please update the app to a newer version!')
    }

    // Enable UI elements
    $('.tooltipped2').tooltip()
    $('.collapsible').collapsible()
    helpers.enableDropdowns('.dropdown-trigger2')
  }
}
