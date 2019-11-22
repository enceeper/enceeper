//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Clipboard related functionality
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

const { clipboard } = require('electron')
const helpers = require('../helpers.js')
const uicommon = require('../ui/common.js')
const wrapper = require('../wrapper.js')

// Used by copySlotPassword and copyPassword
function copyPass (password) {
  copyToClipboardAndReset(password)
  uicommon.showOkMessage('Password copied to clipboard.')
}

// Handle clipboard and reset functionality
function copyToClipboardAndReset (value) {
  var clipboardClear = global.store.get('clipboard.clear') || true
  var clipboardTimeout = global.store.get('clipboard.timeout') || 60000

  clipboard.writeText(value)

  if (clipboardClear) {
    setTimeout(function () {
      var newvalue = clipboard.readText()

      if (newvalue === value) {
        clipboard.clear()
      }
    }, clipboardTimeout)
  }
}

module.exports = {
  // Copy slot password (from the input element)
  copySlotPassword: function (target) {
    var x = helpers.getPreviousSibling(target.parentNode.parentNode)
    var input = x.getElementsByTagName('input')[0]

    if (input.value.length > 0) {
      copyPass(input.value)
    }
  },

  // Copy slot identifier from the main UI
  copySlotIdentifier: function (keyId, slotId) {
    var slotDetails = global.enc.getSlotDetails(keyId, slotId)

    clipboard.writeText(slotDetails.identifier)
    uicommon.showOkMessage('Identifier copied to clipboard.')
  },

  // Copy username from the main UI
  copyUsername: function (target) {
    module.exports.copyUser($(target).text())
  },

  // Used by copyUsername from the copy username keyboard shortcut
  copyUser: function (username) {
    copyToClipboardAndReset(username)
    uicommon.showOkMessage('Username copied to clipboard.')
  },

  // Copy password from the main UI and copy password shortcut
  copyPassword: function (keyId) {
    var password = wrapper.getCurrentPassword(global.enc.getPassword(keyId))

    if (password !== null) {
      copyPass(password)
    }
  }
}
