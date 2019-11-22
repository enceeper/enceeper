//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Handles vault entries (add/edit)
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

/* global $, M */

const helpers = require('../helpers.js')
const uicommon = require('./common.js')
const passgen = require('../misc/passgen.js')
const main = require('./main.js')
const validate = require('../validate.js')
const wrapper = require('../wrapper.js')
const config = require('../config.js')

module.exports = {
  addKeyModal: function () {
    module.exports.editKeyModal(-1)
  },

  editKeyModal: function (keyId) {
    // Locate all elements
    var keyModal = $('#keyModal')
    var keyForm = keyModal.find('form')[0]
    var passGen = keyModal.find('.password-generator')[0].childNodes[1].childNodes[1]
    var passwordElem = keyModal.find('#passwordk')[0]
    var chipsElem = keyModal.find('.chips')
    var chips = M.Chips.getInstance(chipsElem[0])
    var textArea1 = keyModal.find('#keyJSON')[0]
    var textArea2 = keyModal.find('#keyNotes')[0]
    var swaper = keyModal.find('.swaper').find('input')[0]

    // Fix password visibility
    helpers.togglePasswordVisibility(helpers.getPreviousSibling(passwordElem), true)
    // Close the password generator
    passgen.togglePasswordGenerator(passGen, true)
    // Reset the form
    keyForm.reset()
    // Reset all helper texts
    keyModal.find('.helper-text').each(function (index, input) {
      if (input.id === 'chipsInfo') {
        return
      }

      input.classList.remove('invalid')
      input.innerHTML = ''
    })
    // Reset the categories
    chipsElem.removeClass('invalid')
    chipsElem.find('input').attr('placeholder', ' ')
    chipsElem.find('.chip').remove()
    chips.chipsData.length = 0
    chips.$chips.length = 0

    // Set keyId to global var
    global.keyDetails = {
      type: 'keyModal',
      keyId: keyId
    }

    textArea1.innerHTML = ''
    textArea2.innerHTML = ''
    M.textareaAutoResize(textArea1)
    M.textareaAutoResize(textArea2)

    if (keyId !== -1) {
      var keyMeta = global.enc.getKeyDetails(keyId).meta
      var keyPassword = global.enc.getPassword(keyId)

      if (!wrapper.canHandleMeta(keyMeta) || !wrapper.canHandleValue(keyPassword)) {
        uicommon.showErrorMessage('Failed while processing the entry.')
        uicommon.showErrorMessage('Please update the app to a newer version!')
        return
      }

      var keyMetaDetails = wrapper.getMetaDetails(keyMeta)
      var keyValueDetails = wrapper.getValueDetails(keyPassword)

      keyModal.find('input, textarea').each(function (index, input) {
        var active = false

        if (input.id === 'keyTitle') {
          input.value = keyMetaDetails.title
          active = true
        } else if (input.id === 'keyUsername' && keyMetaDetails.username.length !== 0) {
          input.value = keyMetaDetails.username
          active = true
        } else if (input.id === 'keyURL' && keyMetaDetails.url.length !== 0) {
          input.value = keyMetaDetails.url
          active = true
        } else if (input.id === 'passwordk' && keyValueDetails.type === 'pass') {
          input.value = keyValueDetails.value
          active = true
        } else if (input.id === 'keyJSON' && keyValueDetails.type === 'text') {
          input.value = keyValueDetails.value
          M.textareaAutoResize(input)
          active = true

          // Toggle Password/Text
          swaper.checked = true
        } else if (input.id === 'keyNotes' && keyMetaDetails.notes.length !== 0) {
          input.value = keyMetaDetails.notes
          M.textareaAutoResize(input)
          active = true
        }

        if (active) {
          helpers.getNextSibling(input).classList.add('active')
        }
      })

      // Populate chips
      for (var j = 0; j < keyMetaDetails.categories.length; j++) {
        chips.addChip({
          tag: keyMetaDetails.categories[j]
        })
      }
    }

    // Reset input/textarea
    helpers.swapInputElements(swaper, 'swapTextInput', 'swapTextArea')

    // Now open the modal
    keyModal.modal('open')

    // We focus via timeout in order for the drop-down menu to close
    setTimeout(function () {
      var keyTitle = $('#keyTitle')

      keyTitle.focus()
      if (keyId !== -1) {
        var val = keyTitle.val()

        keyTitle.val('')
        keyTitle.val(val)
      }
    }, config.FOCUS_TIMEOUT)
  },

  keyConfirmed: function () {
    var categories = validate.categoryRequired($('#keyModal').find('.chips')[0])
    var passTextCheck = $('#keyPassSelector')[0].checked
    var password

    if (passTextCheck) {
      password = validate.inputRequired('keyJSON', false, 'You must provide the text entry.')
    } else {
      password = validate.inputRequired('passwordk', false, 'You must provide your password.')
    }

    var title = validate.inputRequired('keyTitle', true, 'You must provide a title.')

    if (categories !== null && password !== null && title !== null) {
      var meta = wrapper.createMeta(title,
        document.getElementById('keyUsername').value.trim(),
        document.getElementById('keyURL').value.trim(),
        document.getElementById('keyNotes').value.trim(),
        categories)
      var keyEntry = wrapper.createKeyEntry(passTextCheck, password)

      uicommon.openSpinner(200)
      if (global.keyDetails.keyId === -1) {
        global.enc.addKey(meta, wrapper.createKeyValue(keyEntry), module.exports.keyConfirmedSuccess, uicommon.reportFailure)
      } else {
        var keyInfo = global.enc.getKeyDetails(global.keyDetails.keyId)
        var value = global.enc.getPassword(global.keyDetails.keyId)

        // We need to decide if we are going to send meta and value
        if (JSON.stringify(meta) === JSON.stringify(keyInfo.meta)) {
          meta = null
        }

        value = wrapper.updateKeyValue(value, keyEntry)

        global.enc.updateKey(global.keyDetails.keyId, meta, value, keyInfo.status, module.exports.keyConfirmedSuccess, uicommon.reportFailure)
      }
    }

    return false
  },

  keyConfirmedSuccess: function (data) {
    main.populateCategories()
    main.updateKeys()

    uicommon.closeSpinner()
    $('#keyModal').modal('close')

    // If this is the first key in the vault and
    // we do not have the shortcut flag set:
    // 1. Greed the user
    // 2. Display the shortcuts modal
    var shortcuts = global.store.get('messages.shortcuts')
    if (typeof shortcuts === 'undefined') {
      shortcuts = true
    }

    if (global.enc._keys.length === 1 && shortcuts) {
      global.store.set('messages.shortcuts', false)

      uicommon.showOkMessage('Congratulations! You just created your first vault entry.')
      uicommon.showOkMessage('Now let\'s see how you can use it.')
      uicommon.showShortcutsModal()
    }
  },

  setKeyStatus: function (keyId, target) {
    var status = target.checked ? 0 : 1

    uicommon.openSpinner(200)

    global.enc.updateKey(keyId, null, null, status, function () {
      uicommon.closeSpinner()
    }, function (status, errorMessage) {
      var key = global.enc.getKeyDetails(keyId)

      // Reset element
      target.checked = (key.status === 0)

      uicommon.reportFailure(status, errorMessage)
    })
  }
}
