//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Application menu
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

const { app, dialog, shell } = require('electron')

const template = []
let isMac = false

if (process.platform === 'darwin') {
  isMac = true
}

const MNEMONIC_SYM = isMac ? '' : '&'

const applicationMenu = {
  label: `${MNEMONIC_SYM}Application`,
  submenu: [
    ...(isMac
      ? [{ label: `A${MNEMONIC_SYM}bout Enceeper`, role: 'about' }, { type: 'separator' }]
      : []),
    {
      label: `${MNEMONIC_SYM}Preferences`,
      accelerator: 'CmdOrCtrl+,',
      click: function (menuItem, window, e) {
        if (!window || !window.webContents) {
          return
        }
        window.webContents.send('toggle-preferences')
      }
    },
    ...(isMac ? [{ type: 'separator' }, { role: 'hide' }, { role: 'hideothers' }] : []),
    { type: 'separator' },
    { label: `${MNEMONIC_SYM}Quit`, accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
  ]
}

const editMenu = {
  label: `${MNEMONIC_SYM}Edit`,
  submenu: [
    { label: `${MNEMONIC_SYM}Undo`, accelerator: 'CmdOrCtrl+Z', role: 'undo' },
    { label: `${MNEMONIC_SYM}Redo`, accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
    { type: 'separator' },
    {
      label: `Copy Pa${MNEMONIC_SYM}ssword`,
      accelerator: 'CmdOrCtrl+D',
      click: function (menuItem, window, e) {
        if (!window || !window.webContents) {
          return
        }
        window.webContents.send('copy-password')
      }
    },
    {
      label: `Copy User${MNEMONIC_SYM}name`,
      accelerator: 'CmdOrCtrl+B',
      click: function (menuItem, window, e) {
        if (!window || !window.webContents) {
          return
        }
        window.webContents.send('copy-username')
      }
    },
    { type: 'separator' },
    { label: `Cu${MNEMONIC_SYM}t`, accelerator: 'CmdOrCtrl+X', role: 'cut' },
    { label: `${MNEMONIC_SYM}Copy`, accelerator: 'CmdOrCtrl+C', role: 'copy' },
    { label: `${MNEMONIC_SYM}Paste`, accelerator: 'CmdOrCtrl+V', role: 'paste' },
    { label: `Select ${MNEMONIC_SYM}All`, accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
  ]
}

const windowMenu = {
  label: `${MNEMONIC_SYM}Window`,
  role: 'window',
  submenu: [
    { label: `Toggle ${MNEMONIC_SYM}Full Screen`, role: 'togglefullscreen' },
    { label: `${MNEMONIC_SYM}Minimize`, role: 'minimize' },
    ...(isMac ? [{ label: `${MNEMONIC_SYM}Close`, role: 'close' }] : [])
  ]
}

const toolsMenu = {
  label: `${MNEMONIC_SYM}Tools`,
  submenu: [
    {
      label: `Import from ${MNEMONIC_SYM}CSV...`,
      click: function (menuItem, window, e) {
        if (!window || !window.webContents) {
          return
        }
        window.webContents.send('menu-import-csv')
      }
    },
    {
      label: `${MNEMONIC_SYM}Sync with Enceeper`,
      click: function (menuItem, window, e) {
        if (!window || !window.webContents) {
          return
        }
        window.webContents.send('sync-now')
      }
    }
  ]
}

const helpMenu = {
  label: `${MNEMONIC_SYM}Help`,
  role: 'help',
  id: 'help',
  submenu: [
    {
      label: `Contact ${MNEMONIC_SYM}Support`,
      click: () => {
        shell.openExternal('https://github.com/enceeper/enceeper/issues')
      }
    },
    {
      label: `View User ${MNEMONIC_SYM}Manual`,
      click: () => {
        shell.openExternal('https://github.com/enceeper/enceeper#enceeper')
      }
    },
    {
      label: `${MNEMONIC_SYM}Keyboard Shortcuts`,
      accelerator: 'CmdOrCtrl+Shift+?',
      click: (menuItem, window, e) => {
        if (!window || !window.webContents) {
          return
        }
        window.webContents.send('toggle-shortcuts')
      }
    }
  ]
}

if (!isMac) {
  helpMenu.submenu.unshift({
    label: `${MNEMONIC_SYM}About`,
    click: () => {
      dialog.showMessageBox({
        type: 'info',
        title: app.getName(),
        message: app.getName() + ' App',
        detail: 'Version ' + app.getVersion()
      })
    }
  })
}

template.push(applicationMenu)
template.push(editMenu)
template.push(windowMenu)
template.push(toolsMenu)
template.push(helpMenu)

exports.template = template
