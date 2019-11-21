//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// JSON encapsulation of meta and value of a vault entry
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

const uicommon = require('./ui/common.js')
const config = require('./config.js')

module.exports = {
  // The meta encapsulation
  createMeta: function (title, username, url, notes, categories) {
    var meta = {
      v: config.META_CURRENT_VERSION,
      t: title,
      u: username,
      l: url,
      n: notes,
      c: categories
    }

    return meta
  },

  // The key entries inside the value encapsulation
  createKeyEntry: function (passTextCheck, password) {
    var keyEntry = {
      t: passTextCheck ? 'text' : 'pass',
      v: password,
      s: Math.floor(Date.now() / 1000)
    }

    return keyEntry
  },

  // The value encapsulation
  createKeyValue: function (keyEntry) {
    var value = {
      v: config.VALUE_CURRENT_VERSION,
      p: [keyEntry]
    }

    return value
  },

  updateKeyValue: function (value, entry) {
    if (module.exports.canHandleValue(value)) {
      // We now must apply version specific handling
      if (value.p[0].t === entry.t && value.p[0].v === entry.v) {
        return null
      } else {
        // Add new entry
        value.p.unshift(entry)
        // Remove past entries
        if (value.p.length > config.MAX_PASSWORD_HISTORY) {
          value.p.length = config.MAX_PASSWORD_HISTORY
        }

        return value
      }
    } else {
      // The safest is to create a new entry if we
      // cannot handle the version number provided
      return module.exports.createKeyValue(entry)
    }
  },

  canHandleMeta: function (meta) {
    return (meta.v === 1)
  },

  canHandleValue: function (value) {
    return (value.v === 1)
  },

  // Get username
  getUsername: function (meta) {
    if (!module.exports.canHandleMeta(meta)) {
      uicommon.showErrorMessage('Failed while processing the entry details.')
      uicommon.showErrorMessage('Please update the app to a newer version!')
      return null
    }

    // We now must apply version specific handling
    return meta.u
  },

  // Get username
  getTitle: function (meta) {
    if (!module.exports.canHandleMeta(meta)) {
      return null
    }

    // We now must apply version specific handling
    return meta.t
  },

  // Get username
  getMetaDetails: function (meta) {
    if (!module.exports.canHandleMeta(meta)) {
      return null
    }

    // We now must apply version specific handling
    return {
      title: meta.t,
      username: meta.u,
      url: meta.l,
      notes: meta.n,
      categories: meta.c
    }
  },

  getValueDetails: function (value) {
    if (!module.exports.canHandleValue(value)) {
      return null
    }

    // We now must apply version specific handling
    return {
      type: value.p[0].t,
      value: value.p[0].v
    }
  },

  // Get current password
  getCurrentPassword: function (value) {
    if (!module.exports.canHandleValue(value)) {
      uicommon.showErrorMessage('Failed while processing the entry.')
      uicommon.showErrorMessage('Please update the app to a newer version!')
      return null
    }

    // We now must apply version specific handling
    return value.p[0].v
  },

  // Sorting the keys
  keysAlphaSort: function (x, y) {
    var t1 = module.exports.getTitle(x.meta)
    var t2 = module.exports.getTitle(y.meta)

    if (t1 === null || t1 === null) {
      return 0
    }

    return t1.localeCompare(t2, undefined, { sensitivity: 'base' })
  }
}
