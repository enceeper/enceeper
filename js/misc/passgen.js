//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Password generator plugin functionality
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

/* global M */

const helpers = require('../helpers.js')
const uicommon = require('../ui/common.js')

function generatePassword (elements) {
  var symbols = prepareSymbols(elements)
  var strengthSelection
  var passwordLength = ''
  var passwordEntropy = ''
  var password

  elements.forEach(function (item) {
    if (item.name === 'passGenStrength' && item.checked) {
      strengthSelection = item.value
    }
    if (item.name === 'passGenLength' || item.name === 'passGenEntropy') {
      var num = parseInt(item.value)
      var min = parseInt(item.getAttribute('min'))
      var max = parseInt(item.getAttribute('max'))

      if (num >= min && num <= max) {
        if (item.name === 'passGenLength') {
          passwordLength = item.value
        } else {
          passwordEntropy = item.value
        }
      }
    }
  })

  // Check symbols low limit
  if (symbols.length < 10) {
    throw new Error('You must select at least 10 possible characters.')
  }
  // Check input values
  if (strengthSelection === 'length') {
    if (passwordLength.length === 0) {
      throw new Error('Please provide a valid number for the password length (8 ~ 128).')
    }
  } else {
    if (passwordEntropy.length === 0) {
      throw new Error('Please provide a valid number for the password entropy (32 ~ 512).')
    }
    passwordLength = Math.ceil(parseFloat(passwordEntropy) * Math.log(2) / Math.log(symbols.length))
  }

  password = ''
  for (var i = 0; i < passwordLength; i++) {
    password += symbols[getRandomNumber(symbols.length)]
  }

  return password
}

function prepareSymbols (elements) {
  var symbols = ''
  var customEnabled = false
  var customSymbols = ''

  elements.forEach(function (item) {
    if (item.name === 'passGenStrength' || item.name === 'passGenLength' || item.name === 'passGenEntropy') {
      return
    } else if (item.name === 'passGenCustom') {
      customEnabled = item.checked
      return
    } else if (item.name === 'passGenCustomChars') {
      customSymbols = item.value
      return
    }

    if (item.checked) {
      symbols += item.getAttribute('data-value')
    }
  })

  if (customEnabled) {
    symbols = addCustomSymbols(symbols, customSymbols)
  }

  return Array.from(symbols)
}

// Check if valid UTF-16
// https://en.wikipedia.org/wiki/UTF-16#Description
function addCustomSymbols (symbols, customSymbols) {
  var code
  var char

  // This loop will add the custom symbols but ignore invalid UTF-16 characters
  for (var i = 0; i < customSymbols.length; i++) {
    code = customSymbols.charCodeAt(i)

    // U+0000 to U+D7FF and U+E000 to U+FFFF
    if (code <= 0xD7FF || code >= 0xE000) {
      char = customSymbols.charAt(i)
      if (symbols.indexOf(char) === -1) {
        symbols += char
      }
    } else if (code <= 0xDBFF && customSymbols.length > (i + 1)) {
      // High: D800 ~ DBFF
      // Low:  DC00 ~ DFFF
      code = customSymbols.charCodeAt(i + 1)
      if (code >= 0xDC00 && code <= 0xDFFF) {
        char = customSymbols.substring(i, i + 2)
        if (symbols.indexOf(char) === -1) {
          symbols += char
        }

        i++
      }
    }
  }

  return symbols
}

function getRandomNumber (max) {
  var x = new Uint32Array(1)

  window.crypto.getRandomValues(x)
  return x[0] % max
}

module.exports = {
  /** Toggle password generator */
  togglePasswordGenerator: function (target, forceClose) {
    var generator = target.parentNode.parentNode
    var instance = M.Collapsible.getInstance(generator)
    var toggle = generator.parentNode.getElementsByClassName('swaper')[0]

    forceClose = forceClose || false
    if (target.parentNode.classList.contains('active')) {
      target.classList.remove('btn-flat')
      instance.close(0)

      if (toggle) {
        setTimeout(function () {
          toggle.classList.remove('hide')
        }, 250)
      }
    } else if (!forceClose) {
      target.classList.add('btn-flat')
      instance.open(0)

      if (toggle) {
        toggle.classList.add('hide')
      }
    }
  },

  passGenFocus: function (target) {
    if (target.checked) {
      var parent = target.parentNode.parentNode
      var next = helpers.getNextSibling(parent)
      var input = next.childNodes[1]
      var tmpStr = input.value

      input.focus()
      input.value = ''
      input.value = tmpStr
    }
  },

  passGenCheckCustom: function (target) {
    var x = helpers.getPreviousSibling(target.parentNode)
    var check = x.childNodes[1].childNodes[1]

    if (!check.checked) {
      check.checked = true
    }
  },

  passGenAccept: function (target) {
    var generator = target.parentNode.parentNode.parentNode.parentNode.parentNode
    var elements = generator.querySelectorAll('input')
    var passElem = helpers.getPreviousSibling(generator.parentNode).childNodes[1].childNodes[3]
    var password

    try {
      password = generatePassword(elements)

      passElem.focus()
      passElem.value = password
      module.exports.togglePasswordGenerator(generator.childNodes[1].childNodes[1])
    } catch (e) {
      uicommon.showErrorMessage(e.message)
    }
  }
}
