//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Event handlers
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

const { ipcRenderer } = require('electron')
const mousetrap = require('mousetrap')
const user = require('../user.js')
const uicommon = require('../ui/common.js')
const settings = require('../ui/settings.js')
const keys = require('../ui/keys.js')
const clipboard = require('./clipboard.js')
const wrapper = require('../wrapper.js')

// Open the preferences
ipcRenderer.on('toggle-preferences', () => {
  if (!user.isLogged()) {
    uicommon.showWarningMessage('Please login first.')
  }

  if (user.isLogged() && !uicommon.isModalOpen()) {
    settings.viewSettings()
  }
})

ipcRenderer.on('copy-password', () => {
  if (user.isLogged() && global.selectedKeyId !== -1 && !uicommon.isModalOpen()) {
    clipboard.copyPassword(global.selectedKeyId)
  }
})

ipcRenderer.on('copy-username', () => {
  if (user.isLogged() && global.selectedKeyId !== -1 && !uicommon.isModalOpen()) {
    var username = wrapper.getUsername(global.enc.getKeyDetails(global.selectedKeyId).meta)

    if (username !== null) {
      clipboard.copyUser(username)
    }
  }
})

// Open the shortcuts info modal
ipcRenderer.on('toggle-shortcuts', () => {
  if (!user.isLogged()) {
    uicommon.showWarningMessage('Please login first.')
  }

  if (user.isLogged() && !uicommon.isModalOpen()) {
    uicommon.showShortcutsModal()
  }
})

// -- Events block to calculate the idle time
$(window).on('focus', function () {
  global.winFocus = true
})

$(window).on('blur', function () {
  global.winFocus = false
})

$(window).on('mousemove', function () {
  if (global.winFocus) {
    global.idleStamp = new Date()
  }
})

$(window).on('keyup', function () {
  global.idleStamp = new Date()
})
// --

module.exports = {
  registerKeyboardShortcuts: function () {
    // New key
    mousetrap.bind(['command+n', 'ctrl+n'], function (e) {
      if (user.isLogged() && !uicommon.isModalOpen()) {
        keys.addKeyModal()
      }
      return false
    })

    // More shortcuts in the future ...
  }
}
