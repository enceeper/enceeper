//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Modules to control application life and create native browser window
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

const { app, BrowserWindow, systemPreferences, nativeTheme, Menu, ipcMain, dialog } = require('electron')
const fs = require('fs')
const windowStateKeeper = require('electron-window-state')
const template = require('./js/menu.js').template
const { autoUpdater } = require('electron-updater')

// Remove macOS default menu items
if (process.platform === 'darwin') {
  systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
  systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
}

// Build the menu
const menu = Menu.buildFromTemplate(template)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

if (process.platform === 'darwin') {
  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    function themeHasChanged () {
      if (mainWindow !== null) {
        mainWindow.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors)
      }
    }
  )
}

function createWindow () {
  // Set the menu
  Menu.setApplicationMenu(menu)

  // Default browser background color
  var backColor = 'ac3565'
  if (process.platform === 'darwin') {
    if (nativeTheme.shouldUseDarkColors) {
      backColor = '360f20'
    }
  }

  // Get primary display
  const mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600,
    resetToCenter: true
  })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 700,
    minHeight: 600, // This is for the register form
    webPreferences: {
      nodeIntegration: true
    },
    show: false,
    backgroundColor: '#' + backColor
  })

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(mainWindow)

  // and load the index.html of the app.
  mainWindow.loadFile('index.html', {
    query: {
      background: backColor
    }
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    if (process.platform === 'darwin') {
      mainWindow.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors)
    }
    mainWindow.show()
  })

  // app.dock.bounce('critical')
  // app.dock.setBadge('5')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('show-select-file-dialog', () => {
  var contents = null
  var results = dialog.showOpenDialog(mainWindow, {
    title: 'Open CSV file (Exported by KeePass)',
    properties: ['openFile'],
    filters: [
      { name: 'Comma Separated Values', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (results !== undefined) {
    contents = fs.readFileSync(results[0], 'utf8')
  }

  mainWindow.webContents.send('import-csv', contents)
})

ipcMain.on('check-and-install-updates', () => {
  autoUpdater.checkForUpdatesAndNotify()
})
