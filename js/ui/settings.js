//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Display and update the settings
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

const helpers = require('../helpers.js')

function checkInputSettings (elem) {
  var valid = true
  var prevElem = helpers.getPreviousSibling(elem)
  var parsedValue = parseInt(prevElem.value)

  if (isNaN(parsedValue) || parsedValue < 1 || parsedValue > 600) {
    elem.classList.add('invalid')
    elem.innerHTML = 'Range in: 1 ~ 600'

    prevElem.value = ''
    prevElem.focus()

    valid = false
  }

  return valid
}

module.exports = {
  // View settings modal
  viewSettings: function () {
    var settingsModal = $('#settingsModal')

    // Reset all helper texts
    settingsModal.find('.helper-text').each(function (index, input) {
      input.classList.remove('invalid')
      input.innerHTML = ''
    })
    // Prefill settings
    settingsModal.find('input').each(function (index, input) {
      if (input.name.length === 0) {
        return
      }
      var key = input.name.substring(9)
      var value

      if (input.type === 'checkbox') {
        value = global.store.get(key)
        if (typeof value === 'undefined') {
          value = (key !== 'autolock.enabled')
        }
        input.checked = value
      } else {
        value = global.store.get(key) || (key === 'clipboard.timeout' ? 60000 : 600000)

        value /= 1000
        if (key === 'autolock.timeout') {
          value /= 60
        }

        input.value = value
      }
    })

    // Now open the modal
    settingsModal.modal('open')
  },

  // Save settings action
  saveSettings: function () {
    var settingsModal = $('#settingsModal')
    var valid = true

    // Reset all helper texts
    settingsModal.find('.helper-text').each(function (index, input) {
      input.classList.remove('invalid')
      input.innerHTML = ''
    })

    valid = checkInputSettings(document.getElementById('settings.autolock.timeout_helper')) && valid
    valid = checkInputSettings(document.getElementById('settings.clipboard.timeout_helper')) && valid

    if (valid) {
      // Store everything
      settingsModal.find('input').each(function (index, input) {
        if (input.name.length === 0) {
          return
        }
        var key = input.name.substring(9)
        var value

        if (input.type === 'checkbox') {
          global.store.set(key, input.checked)
        } else {
          value = input.value

          value *= 1000
          if (key === 'autolock.timeout') {
            value *= 60
          }

          global.store.set(key, parseInt(value))
        }
      })

      // Check if keep is on or off
      if (global.store.get('keep')) {
        global.store.set('email', global.enc._api._email)
      } else {
        global.store.delete('email')
      }

      // Now close the modal
      settingsModal.modal('close')
    }

    return false
  }
}
