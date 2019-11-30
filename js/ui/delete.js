//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Delete functionality (entry, slot, account)
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
const main = require('./main.js')
const user = require('../user.js')

function deleteKeyModal (keyId, target) {
  var message = document.getElementById('deleteMessage')

  global.deleteDetails = {
    type: 'deleteKey',
    keyId: keyId,
    target: target
  }

  message.innerHTML = 'Are you sure you want to permanently delete this entry?<br /><small>You cannot undo this action.</small>'
  $('#deleteModal').modal('open')
}

// This function is called by deleteConfirmed when the user confirms the delete
function deleteKey (keyId, target) {
  var details = global.enc.getKeyDetails(keyId)

  uicommon.openSpinner(200)

  if (details.shared) {
    global.enc.deleteSlot(keyId, details.slots[0].slot_id, function (data) {
      target.remove()

      deleteKeySuccess()
    }, uicommon.reportFailure)
  } else {
    global.enc.deleteKey(keyId, function (data) {
      var next = helpers.getNextSibling(target)

      next.remove()
      target.remove()

      deleteKeySuccess()
    }, uicommon.reportFailure)
  }
}

// This function is called by deleteConfirmed when the user confirms the delete
function deleteKeySuccess () {
  // Reset selectedKeyId
  global.selectedKeyId = -1

  // If we have deleted all the keys in a category: refresh categories
  main.populateCategories()
  // If we are in the category of the last deleted key: force select another category
  if (document.querySelector('.key-row-with-slot') === null) {
    var catlinks = document.querySelector('.category_link')

    if (catlinks !== null) {
      main.selectCategory(catlinks.childNodes[0])
    }
  }

  // Update the badges
  uicommon.updateBadges()

  uicommon.closeSpinner()
}

// This function is called by deleteConfirmed when the user confirms the delete
function deleteSlot (keyId, slotId, target) {
  uicommon.openSpinner(200)

  global.enc.deleteSlot(keyId, slotId, function (data) {
    var elem = target.parentNode.parentNode
    var key = global.enc.getKeyDetails(keyId)

    // If no slots left: contract, hide expand icon
    if (key.slots.length === 1) {
      var trElem = helpers.getPreviousSibling(elem.parentNode.parentNode.parentNode.parentNode.parentNode)
      var button = trElem.querySelector('.expandButton')

      helpers.expandSlots(button)
      button.classList.add('hide')
    }

    elem.remove()
    uicommon.closeSpinner()
  }, uicommon.reportFailure)
}

// This function is called by deleteConfirmed when the user confirms the delete
function deleteAccount () {
  uicommon.openSpinner(200)

  global.enc.delete(function (data) {
    global.store.clear()

    uicommon.closeSpinner()

    // We need to logout
    user.logout()
  }, uicommon.reportFailure)
}

module.exports = {
  // This function is called by the confirm button of the delete modal and dispatches the request to the correct action
  deleteConfirmed: function () {
    $('#deleteModal').modal('close')

    if (global.deleteDetails.type === 'deleteSlot') {
      deleteSlot(global.deleteDetails.keyId, global.deleteDetails.slotId, global.deleteDetails.target)
    } else if (global.deleteDetails.type === 'deleteKey') {
      deleteKey(global.deleteDetails.keyId, global.deleteDetails.target)
    } else if (global.deleteDetails.type === 'deleteAccount') {
      deleteAccount()
    }
  },

  // Prepeare the delete modal for my key deletion and show it
  deleteMyKey: function (keyId, target) {
    deleteKeyModal(keyId, target.parentNode.parentNode.parentNode.parentNode)
  },

  // Prepeare the delete modal for shared key deletion and show it
  deleteSharedKey: function (keyId, target) {
    deleteKeyModal(keyId, target.parentNode.parentNode)
  },

  // Prepeare the delete modal for slot deletion and show it
  deleteSlotModal: function (keyId, slotId, target) {
    var message = document.getElementById('deleteMessage')

    global.deleteDetails = {
      type: 'deleteSlot',
      keyId: keyId,
      slotId: slotId,
      target: target
    }

    message.innerHTML = 'Are you sure you want to permanently delete the slot?<br /><small>You cannot undo this action.</small>'
    $('#deleteModal').modal('open')
  },

  // Prepeare the delete modal for account deletion and show it
  deleteAccountModal: function () {
    var message = document.getElementById('deleteMessage')

    global.deleteDetails = {
      type: 'deleteAccount'
    }

    message.innerHTML = 'Are you sure you want to permanently delete your account?<br /><small>You cannot undo this action.</small>'
    $('#deleteModal').modal('open')
  }
}
