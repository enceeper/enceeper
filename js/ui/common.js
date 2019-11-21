//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Common UI helpers
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

/* global $, M, DOMParser */

const { shell, remote, ipcRenderer } = require('electron')
const vercmp = require('compare-versions')
const user = require('../user.js')
// const update = require('./update.js')
const config = require('../config.js')

let spinnerTimer

module.exports = {
  // Check if ANY modal is open
  isModalOpen: function () {
    return (M.Modal._modalsOpen !== 0)
  },

  // Get modal instance
  getModalInstance: function (id) {
    return M.Modal.getInstance(document.getElementById(id))
  },

  // Check if modal is open and close it
  closeModalIfOpen: function (id) {
    var instance = module.exports.getModalInstance(id)

    if (instance.isOpen) {
      instance.close()
    }
  },

  // Open spinner for long running tasks (with an optional delay)
  openSpinner: function (delay) {
    var instance = module.exports.getModalInstance('spinner-modal')

    delay = delay || 0

    if (delay === 0) {
      instance.open()
    } else {
      spinnerTimer = setTimeout(function () {
        instance.open()
      }, delay)
    }
  },

  // Close spinner, the task has ended
  closeSpinner: function () {
    clearTimeout(spinnerTimer)
    module.exports.closeModalIfOpen('spinner-modal')
  },

  // Show error message
  showErrorMessage: function (message) {
    M.toast({ html: message, displayLength: 8000, classes: 'red' })
  },

  // Show warning message
  showWarningMessage: function (message) {
    M.toast({ html: message, classes: 'orange' })
  },

  // Show success message
  showOkMessage: function (message) {
    M.toast({ html: message, classes: 'green' })
  },

  loadTemplate: function (name) {
    var template = module.exports.getTemplate(name)
    $('body').append(template)
  },

  getTemplate: function (name) {
    // -> Old way
    // return document.querySelector('#' + name + '_template').import.querySelector('.template').innerHTML
    // -> New way (also deprecated since we use synchronous requests)
    // Load the templates and then continue with the initialization
    var txt = $.ajax({
      type: 'GET',
      url: 'templates/' + name + '.html',
      async: false
    }).responseText

    var html = new DOMParser().parseFromString(txt, 'text/html')

    return html.querySelector('.template').innerHTML
  },

  // Update the UI badges
  updateBadges: function () {
    var menuBadge = document.getElementById('menuBadge')
    var dropBadge = document.getElementById('dropBadge')

    if (global.enc._shares.length === 0) {
      menuBadge.classList.add('hide')
      dropBadge.classList.add('hide')
    } else {
      menuBadge.innerHTML = global.enc._shares.length
      menuBadge.classList.remove('hide')
      dropBadge.innerHTML = global.enc._shares.length
      dropBadge.classList.remove('hide')
    }
  },

  // Decode notification
  decodeNotif: function (notify) {
    return {
      text: (notify === 0) ? 'No notification' : ((notify === 1) ? 'Notify' : 'Approve first'),
      icon: (notify === 0) ? 'notifications_off' : ((notify === 1) ? 'notifications' : 'vpn_key')
    }
  },

  checkVersionsAndReport: function (data) {
    var d1 = Date.now()
    var d2

    d2 = new Date(0)
    d2.setUTCSeconds(global.store.get('postpone.appver') || 0)
    if (d2 < d1) {
      // Initiate auto updater
      ipcRenderer.send('check-and-install-updates')

      if (vercmp(data.enceeper.app.version, remote.app.getVersion()) === 1) {
        module.exports.showWarningMessage('A new version of the App is available (' + data.enceeper.app.version + ')')
        global.store.set('postpone.appver', d1 + config.WARNINGS_POSTPONE)
      }
    }

    d2 = new Date(0)
    d2.setUTCSeconds(global.store.get('postpone.apiver') || 0)
    if (d2 < d1) {
      if (data.enceeper.api.deprecated !== null) {
        module.exports.showErrorMessage(data.enceeper.api.deprecated)
        global.store.set('postpone.apiver', d1 + config.WARNINGS_POSTPONE)
      }
    }
  },

  // Open link and prepend http:// if necessary
  openLink: function (link) {
    try {
      try {
        // eslint-disable-next-line
        new URL(link)
      } catch (e) {
        link = 'http://' + link

        // eslint-disable-next-line
        new URL(link)
      }

      shell.openExternal(link)
    } catch (e) {
      module.exports.showErrorMessage('Failed to open link: ' + link + '.')
    }
  },

  // Report failure from the enceeper JS lib
  reportFailure: function (status, errorMessage) {
    module.exports.closeSpinner()
    module.exports.showErrorMessage(errorMessage)

    if (user.isLogged()) {
      module.exports.checkErrorAndAct(status, errorMessage)
    }
  },

  // Helper function for certain types of errors
  checkErrorAndAct: function (status, errorMessage) {
    // Cases:
    // - The password was updated on another instance of the app
    // - Used the cache with correct password, but incorrect username. Once online authentication failed.
    if (status === 400 && (errorMessage === 'Password has expired, re-auth' || errorMessage === 'User authentication failed')) {
      global.store.delete('cache')
      user.logout()
    }

    // Case:
    // - The modal is using a deleted entry (keyId or slotId), close the modal (keyModal, slotModal, shareModal)
    if (status === 404 && errorMessage !== 'User not found') {
      module.exports.closeModalIfOpen('keyModal')
      module.exports.closeModalIfOpen('slotModal')
      module.exports.closeModalIfOpen('shareModal')

      // Force sync (forcing a re-sync introduces a cyclic dependency
      // between common.js and update.js)
      //
      // This makes the browser fail to load common.js
      //
      // update.sync()
      //
      // So the work around: schedule a resync via the update stamp
      // Caveat: it will not happen immediately (wrost case scenario: see
      // how frequent handleBackgroundJobs is called)
      global.updateStamp = new Date('December 17, 1980 00:00:00')
    }
  }
}
