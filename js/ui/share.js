//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// The functionality to create a new share request
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

const uicommon = require('./common.js')
const validate = require('../validate.js')
const config = require('../config.js')

module.exports = {
  // Open the share modal
  shareModal: function (keyId) {
    var shareModal = $('#shareModal')
    var shareForm = shareModal.find('form')[0]

    // Reset the form
    shareForm.reset()
    // Reset all helper texts
    shareModal.find('.helper-text').each(function (index, input) {
      input.classList.remove('invalid')
      input.innerHTML = ''
    })
    // Set the keyId
    document.getElementById('shareKeyId').value = keyId

    // Now open the modal
    shareModal.modal('open')

    // We focus via timeout in order for the drop-down menu to close
    setTimeout(function () {
      document.getElementById('shareEmail').focus()
    }, config.FOCUS_TIMEOUT)
  },

  // Create a new share request
  shareRequest: function () {
    var email = validate.inputEmail('shareEmail')
    var keyId = parseInt(document.getElementById('shareKeyId').value)

    if (email !== null) {
      uicommon.openSpinner()

      global.enc.createShare(email, keyId, function (data) {
        // Set the badges
        uicommon.updateBadges()

        uicommon.closeSpinner()
        $('#shareModal').modal('close')
      }, uicommon.reportFailure)
    }

    return false
  }
}
