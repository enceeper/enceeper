//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Slot management functionality (add, edit)
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
const passgen = require('../misc/passgen.js')
const main = require('./main.js')
const validate = require('../validate.js')
const config = require('../config.js')

function slotConfirmedSuccess (data) {
  if (global.keyDetails.slotId === -1) {
    var tr = document.getElementById('keyRow_' + global.keyDetails.keyId)
    var next = helpers.getNextSibling(tr)
    var button = tr.querySelector('.expandButton')
    var place = next.querySelector('.collapsible-body')

    var slots = data.result.key.slots
    var slot = slots[slots.length - 1]

    place.insertAdjacentHTML('beforeend', main.prepareSlotEntry(global.keyDetails.keyId, slot))

    button.classList.remove('hide')
  }

  uicommon.closeSpinner()
  $('#slotModal').modal('close')
}

module.exports = {
  addSlotModal: function (keyId) {
    module.exports.editSlotModal(keyId, -1)
  },

  editSlotModal: function (keyId, slotId) {
    var slotModal = $('#slotModal')
    var slotForm = slotModal.find('form')[0]
    var passGen = slotModal.find('.password-generator')[0].childNodes[1].childNodes[1]
    var passwordElem = slotModal.find('#passwords')[0]

    // Fix password visibility
    helpers.togglePasswordVisibility(helpers.getPreviousSibling(passwordElem), true)
    // Close the password generator
    passgen.togglePasswordGenerator(passGen, true)
    // Reset the form
    slotForm.reset()
    // Reset all helper texts
    slotModal.find('.helper-text').each(function (index, input) {
      input.classList.remove('invalid')
      input.innerHTML = ''
    })

    // Set keyId to global var
    global.keyDetails = {
      type: 'slotModal',
      keyId: keyId,
      slotId: slotId
    }

    // Now open the modal
    slotModal.modal('open')

    // We focus via timeout in order for the drop-down menu to close
    setTimeout(function () {
      passwordElem.focus()
    }, config.FOCUS_TIMEOUT)
  },

  slotConfirmed: function () {
    var password = validate.inputRequired('passwords', false, 'You must provide the password.')

    if (password !== null) {
      uicommon.openSpinner()

      setTimeout(function () {
        if (global.keyDetails.slotId === -1) {
          global.enc.addSlot(global.keyDetails.keyId, password, 0, slotConfirmedSuccess, uicommon.reportFailure)
        } else {
          var slotInfo = global.enc.getSlotDetails(global.keyDetails.keyId, global.keyDetails.slotId)

          global.enc.updateSlot(global.keyDetails.keyId, global.keyDetails.slotId, password, slotInfo.notify, slotInfo.status,
            slotConfirmedSuccess, uicommon.reportFailure)
        }
      }, config.WAIT_FOR_SPINNER)
    }

    return false
  },

  setSlotStatus: function (keyId, slotId, target) {
    var notif = parseInt(document.getElementById('slotNotif_' + slotId).value)
    var status = target.checked ? 0 : 1

    uicommon.openSpinner(200)
    global.enc.updateSlot(keyId, slotId, null, notif, status, function () {
      uicommon.closeSpinner()
    }, function (status, errorMessage) {
      var slot = global.enc.getSlotDetails(keyId, slotId)

      // Reset element
      target.checked = (slot.status === 0)

      uicommon.reportFailure(status, errorMessage)
    })
  },

  setSlotNotif: function (keyId, slotId, target) {
    var notif = parseInt(target.value)
    var status = document.getElementById('slotStatus_' + slotId).checked ? 0 : 1

    uicommon.openSpinner(200)
    global.enc.updateSlot(keyId, slotId, null, notif, status, function () {
      // Update UI
      var indicator = document.getElementById('indicatorNotif_' + slotId)
      var dec = uicommon.decodeNotif(notif)

      indicator.setAttribute('data-tooltip', dec.text)
      indicator.innerHTML = dec.icon

      uicommon.closeSpinner()
    }, function (status, errorMessage) {
      var slot = global.enc.getSlotDetails(keyId, slotId)

      // Reset element
      target.value = slot.notify

      uicommon.reportFailure(status, errorMessage)
    })
  }
}
