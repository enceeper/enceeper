//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Import functionality (only from CSV files)
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
const csv = require('jquery-csv')
const wrapper = require('../wrapper.js')
const user = require('../user.js')
const keys = require('../ui/keys.js')
const uicommon = require('../ui/common.js')

// Listen for the menu item selection of import
ipcRenderer.on('menu-import-csv', () => {
  if (!user.isLogged()) {
    uicommon.showWarningMessage('Please login first.')
    return
  }

  if (!uicommon.isModalOpen()) {
    uicommon.openSpinner(200)
    // We are OK, select and read the file in the main process
    ipcRenderer.send('show-select-file-dialog')
  } else {
    uicommon.showWarningMessage('Please close all windows and then use the import tool.')
  }
})

// Listen on the finished loading file from the main process
ipcRenderer.on('import-csv', (event, arg) => {
  var array
  var indexTitle, indexUsername, indexNotes, indexURL, indexCategory, indexPassword
  var keysOk, keysSkipped

  if (arg === null) {
    uicommon.closeSpinner()
    return
  }

  array = csv.toArrays(arg)
  indexTitle = indexUsername = indexNotes = indexURL = indexCategory = indexPassword = -1
  keysOk = keysSkipped = 0

  array.forEach((item, index) => {
    // For the first element get the mappings
    if (index === 0) {
      item.forEach((title, pos) => {
        title = title.toLowerCase()

        if (title === 'title') {
          indexTitle = pos
        } else if (title === 'username') {
          indexUsername = pos
        } else if (title === 'password') {
          indexPassword = pos
        } else if (title === 'notes') {
          indexNotes = pos
        } else if (title === 'url') {
          indexURL = pos
        } else if (title === 'group') {
          indexCategory = pos
        }
      })
      return
    }

    // Create the meta and value objects
    var meta = wrapper.createMeta(item[indexTitle].trim(),
      item[indexUsername].trim(),
      item[indexURL].trim(),
      item[indexNotes].trim(),
      [item[indexCategory].toLowerCase().trim()])
    var value = wrapper.createKeyValue(wrapper.createKeyEntry(false, item[indexPassword]))

    // Now add the keys
    global.enc.addKey(meta, value, (data) => {
      keysOk++

      if ((index + 1) === array.length) {
        finishedImport(keysOk, keysSkipped, null, null)
      }
    }, (status, errorMessage) => {
      keysSkipped++

      if ((index + 1) === array.length) {
        finishedImport(keysOk, keysSkipped, status, errorMessage)
      }
    })
  })
})

function finishedImport (keysOk, keysSkipped, status, errorMessage) {
  if (keysOk > 0) {
    keys.keyConfirmedSuccess(null)
    uicommon.showOkMessage('Imported entries: ' + keysOk + ', skipped entries: ' + keysSkipped + '.')
  } else {
    uicommon.closeSpinner()
  }

  if (status !== null) {
    uicommon.reportFailure(status, errorMessage)
  }
}

module.exports = {}
