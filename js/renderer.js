//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// The main entry point of the UI
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

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')
const Store = require('electron-store')

// Misc tools
const clipboard = require('./misc/clipboard.js')
const events = require('./misc/events.js')
/* eslint-disable no-unused-vars */
const importing = require('./misc/import.js')
/* eslint-enable no-unused-vars */
const passgen = require('./misc/passgen.js')
// UI elements
const uicommon = require('./ui/common.js')
const deletes = require('./ui/delete.js')
const keys = require('./ui/keys.js')
const main = require('./ui/main.js')
const notifs = require('./ui/notifs.js')
const plan = require('./ui/plan.js')
const settings = require('./ui/settings.js')
const share = require('./ui/share.js')
const slots = require('./ui/slots.js')
const update = require('./ui/update.js')
const userUI = require('./ui/user.js')
// The rest
const helpers = require('./helpers.js')
const user = require('./user.js')
const validate = require('./validate.js')

/**
 *  Global variables
 */
global.enc = null
global.store = new Store()
global.selectedKeyId = -1
global.deleteDetails = null
global.keyDetails = null
global.idleStamp = new Date()
global.updateStamp = global.idleStamp
global.winFocus = true
global.sidenav = null
// Helper for height fix on sidenav
global.mainWindow = null
// Template helpers
global.categoryEntry = uicommon.getTemplate('categoryEntry')
global.keyEntry = uicommon.getTemplate('keyEntry')
global.slotEntry = uicommon.getTemplate('slotEntry')
global.shareEntry = uicommon.getTemplate('shareEntry')

// Generic error handler
process.on('uncaughtException', err => {
  uicommon.showErrorMessage('A problem occured, please logout and login again.')
  console.error('Exception:', err.stack)
  uicommon.closeSpinner()
})

// Support dark and light modes on macOS
ipcRenderer.on('theme-changed', (event, arg) => {
  if (arg) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
})

$(document).ready(function () {
  // Remove body style
  var sheet = window.document.styleSheets[window.document.styleSheets.length - 1]
  sheet.deleteRule(sheet.cssRules.length - 1)
  // Add generic background
  document.body.classList.add('bodyMain')
  // Get window
  global.mainWindow = $(window)
  global.mainWindow.resize(helpers.fixSidenav)

  // Load and prepare the spinner
  uicommon.loadTemplate('spinner')
  $('.spinner-modal').modal({
    opacity: 0.8,
    dismissible: false
  })

  var passGen = uicommon.getTemplate('passwordGenerator')
  var keyModal = uicommon.getTemplate('keyModal').replace('%PASSGEN_CONTENTS%', passGen)
  var slotModal = uicommon.getTemplate('slotModal').replace('%PASSGEN_CONTENTS%', passGen)

  // Load all modals
  uicommon.loadTemplate('deleteModal')
  $('#deleteModal').modal({
    opacity: 0.5,
    startingTop: '50px',
    endingTop: '100px'
  })

  uicommon.loadTemplate('passwordModal')
  uicommon.loadTemplate('infoModal')
  uicommon.loadTemplate('settingsModal')
  uicommon.loadTemplate('shareModal')
  uicommon.loadTemplate('notifModal')
  $('body').append(keyModal)
  $('body').append(slotModal)
  $('.generic-modal').modal({
    opacity: 0.5,
    onCloseStart: function (elem) {
      var modal = $(elem)

      modal.scrollTop(0)
      modal.find('.modal-content').scrollTop(0)
    }
  })

  $('.chips').chips({
    placeholder: ' ',
    secondaryPlaceholder: '+Category'
  })
  $('.collapsibleGen').collapsible()

  // Load and prepare the login page
  uicommon.loadTemplate('intro')
  $('.tooltipped-r').tooltip()
  // Check locally if we have the email stored
  user.prepareLoginForm().focus()

  events.registerKeyboardShortcuts()

  // Run this function every minute
  setInterval(update.handleBackgroundJobs, 60000)
})

// Close all dropdowns in scroll
$(window).scroll(function () {
  // Close dropdowns that are open
  M.Dropdown._dropdowns.forEach((dropdown, pos) => {
    if (dropdown.isOpen) {
      dropdown.close()
    }
  })
})

// Export functions
module.exports = {
  // Helpers
  activatePostfix: helpers.activatePostfix,
  deactivatePostfix: helpers.deactivatePostfix,
  swapInputElements: helpers.swapInputElements,
  togglePasswordVisibility: helpers.togglePasswordVisibility,
  expandSlots: helpers.expandSlots,
  // Validators
  checkPasswordStrength: validate.checkPasswordStrength,
  comparePasswords: validate.comparePasswords,
  // Common
  openLink: uicommon.openLink,
  // Passgen
  togglePasswordGenerator: passgen.togglePasswordGenerator,
  passGenFocus: passgen.passGenFocus,
  passGenCheckCustom: passgen.passGenCheckCustom,
  passGenAccept: passgen.passGenAccept,
  // User
  changeUser: user.changeUser,
  showRegister: user.showRegister,
  showLogin: user.showLogin,
  register: userUI.register,
  login: userUI.login,
  lock: userUI.lock,
  updatePassword: userUI.updatePassword,
  passwordConfirmed: userUI.passwordConfirmed,
  logout: user.logout,
  webAuth: userUI.webAuth,
  // Main
  search: main.search,
  searchFocus: main.searchFocus,
  searchBlur: main.searchBlur,
  clearSearch: main.clearSearch,
  selectCategory: main.selectCategory,
  selectKeyRow: main.selectKeyRow,
  // Clipboard
  copyUsername: clipboard.copyUsername,
  copyPassword: clipboard.copyPassword,
  copySlotPassword: clipboard.copySlotPassword,
  copySlotIdentifier: clipboard.copySlotIdentifier,
  // Keys
  addKeyModal: keys.addKeyModal,
  editKeyModal: keys.editKeyModal,
  keyConfirmed: keys.keyConfirmed,
  setKeyStatus: keys.setKeyStatus,
  // Slots
  addSlotModal: slots.addSlotModal,
  editSlotModal: slots.editSlotModal,
  slotConfirmed: slots.slotConfirmed,
  setSlotStatus: slots.setSlotStatus,
  setSlotNotif: slots.setSlotNotif,
  // Share
  shareModal: share.shareModal,
  shareRequest: share.shareRequest,
  acceptShare: notifs.acceptShare,
  rejectShare: notifs.rejectShare,
  // Misc
  viewNotifications: notifs.viewNotifications,
  viewPlan: plan.viewPlan,
  viewSettings: settings.viewSettings,
  saveSettings: settings.saveSettings,
  // Delete
  deleteAccountModal: deletes.deleteAccountModal,
  deleteMyKey: deletes.deleteMyKey,
  deleteSharedKey: deletes.deleteSharedKey,
  deleteSlotModal: deletes.deleteSlotModal,
  deleteConfirmed: deletes.deleteConfirmed
}
