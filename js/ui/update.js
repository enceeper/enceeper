//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Handles background jobs (lock on timeout and syncing with the Enceeper Service)
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

const { ipcRenderer } = require('electron')
const uicommon = require('./common.js')
const main = require('./main.js')
const user = require('../user.js')
const userUI = require('./user.js')
const notif = require('./notifs.js')
const config = require('../config.js')

// Menu item sync now
ipcRenderer.on('sync-now', () => {
  if (!user.isLogged()) {
    uicommon.showWarningMessage('Please login first.')
    return
  }

  module.exports.sync()
})

module.exports = {
  handleBackgroundJobs: function () {
    var now = new Date()

    // Job 1: Idle lock
    if (user.isLogged()) {
      var idleDiff = now - global.idleStamp

      if (global.store.get('autolock.enabled') || false) {
        if (global.store.get('autolock.timeout') < idleDiff) {
          userUI.lock()

          // If locking stop here
          return
        }
      }
    }

    // Job 2: Refresh local keys
    if (user.isLogged()) {
      var updateDiff = now - global.updateStamp

      if (config.KEYS_UPDATE_INTERVAL < updateDiff) {
        module.exports.sync()
      }
    }
  },

  // Sync the UI with the server data
  sync: function () {
    global.updateStamp = new Date()

    global.enc.keys(function (data) {
      // Store it in the local cache
      global.store.set('cache', global.enc.getForCache())

      // Report new ver and deprecation warning
      if (global.winFocus) {
        uicommon.checkVersionsAndReport(data)
      }

      main.populateCategories()
      main.updateKeys()
      uicommon.updateBadges()

      // If the notifications modal is open, update the notifications
      if (uicommon.getModalInstance('notifModal').isOpen) {
        notif.populateNotifications()
      }

      // Close modals that alter a deleted entry (slot, key)
      var instance = uicommon.getModalInstance('deleteModal')
      if (instance.isOpen) {
        if (global.deleteDetails.type === 'deleteSlot') {
          module.exports.checkSlotOfModal(instance, global.deleteDetails.keyId, global.deleteDetails.slotId, 'This slot was already deleted!')
        } else if (global.deleteDetails.type === 'deleteKey') {
          module.exports.checkKeyOfModal(instance, global.deleteDetails.keyId, 'This entry was already deleted!')
        }
      }

      instance = uicommon.getModalInstance('keyModal')
      if (instance.isOpen) {
        if (global.keyDetails.keyId !== -1) {
          module.exports.checkKeyOfModal(instance, global.keyDetails.keyId, 'The entry you were editing was deleted!')
        }
      }

      instance = uicommon.getModalInstance('shareModal')
      if (instance.isOpen) {
        module.exports.checkKeyOfModal(instance, parseInt(document.getElementById('shareKeyId').value), 'Cannot share a deleted entry!')
      }

      instance = uicommon.getModalInstance('slotModal')
      if (instance.isOpen) {
        if (global.keyDetails.slotId === -1) {
          module.exports.checkKeyOfModal(instance, global.keyDetails.keyId, 'Cannot add slot to a deleted entry!')
        } else {
          module.exports.checkSlotOfModal(instance, global.keyDetails.keyId, global.keyDetails.slotId, 'The slot you were editing was deleted!')
        }
      }
    }, function (status, errorMessage) {
      uicommon.checkErrorAndAct(status, errorMessage)
    })
  },

  checkKeyOfModal: function (instance, keyId, message) {
    try {
      global.enc.getKeyDetails(keyId)
    } catch (e) {
      uicommon.showErrorMessage(message)
      instance.close()
    }
  },

  checkSlotOfModal: function (instance, keyId, slotId, message) {
    try {
      global.enc.getSlotDetails(keyId, slotId)
    } catch (e) {
      uicommon.showErrorMessage(message)
      instance.close()
    }
  }
}
