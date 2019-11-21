//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Form validation helpers
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

const zxcvbn = require('zxcvbn')

// Check if email format is valid
function validateEmail (value) {
  var input = document.createElement('input')

  input.type = 'email'
  input.required = true
  input.value = value

  return typeof input.checkValidity === 'function' ? input.checkValidity() : /\S+@\S+\.\S+/.test(value)
}

module.exports = {
  // Validate email element
  inputEmail: function (id) {
    var inputElem = document.getElementById(id)
    var inputHelper = document.getElementById(id + '_helper')
    var email = inputElem.value.trim()
    var isValid = true

    // Reset element
    inputElem.classList.remove('invalid')
    inputHelper.classList.remove('invalid')
    inputHelper.innerHTML = ''

    if (email.length === 0) {
      isValid = false
      if (id === 'shareEmail') {
        inputHelper.innerHTML = 'You must provide the email.'
      } else {
        inputHelper.innerHTML = 'You must provide your email.'
      }
    } else if (!validateEmail(email)) {
      isValid = false
      inputHelper.innerHTML = 'The email is invalid.'
    }

    if (!isValid) {
      inputElem.focus()

      inputElem.classList.add('invalid')
      inputHelper.classList.add('invalid')

      return null
    } else {
      return email
    }
  },

  // Validate required element
  inputRequired: function (id, trim, errorMessage) {
    var inputElem = document.getElementById(id)
    var inputHelper = document.getElementById(id + '_helper')
    var value = inputElem.value

    if (trim) {
      value = value.trim()
    }

    // Reset element
    inputElem.classList.remove('invalid')
    inputHelper.classList.remove('invalid')
    inputHelper.innerHTML = ''

    if (value.length === 0) {
      inputElem.focus()

      inputElem.classList.add('invalid')
      inputHelper.classList.add('invalid')
      inputHelper.innerHTML = errorMessage

      return null
    }

    return value
  },

  categoryRequired: function (chipsElem) {
    var categoriesElem = chipsElem.parentNode
    var inputElem = categoriesElem.getElementsByTagName('input')[0]
    var inputHelper = categoriesElem.getElementsByClassName('chips_helper')[0]
    var values = M.Chips.getInstance(chipsElem).chipsData

    // Reset element
    chipsElem.classList.remove('invalid')
    inputHelper.classList.remove('invalid')
    inputHelper.innerHTML = ''

    if (values.length === 0) {
      inputElem.focus()

      chipsElem.classList.add('invalid')
      inputHelper.classList.add('invalid')
      inputHelper.innerHTML = 'You must provide at least one category.'

      return null
    } else {
      var categories = []

      for (var i = 0; i < values.length; i++) {
        categories.push(values[i].tag.toLowerCase())
      }

      return categories
    }
  },

  checkPasswordStrength: function (target) {
    var x = zxcvbn(target.value)
    var inputHelper = document.getElementById(target.id + '_helper')

    target.classList.remove('invalid')
    inputHelper.classList.remove('invalid')
    inputHelper.innerHTML = ''

    if (x.score < 3) {
      inputHelper.classList.add('invalid')
      target.classList.add('invalid')

      if (x.feedback.warning.length > 0) {
        inputHelper.innerHTML = x.feedback.warning + '.'
      } else {
        var suggest = ''

        x.feedback.suggestions.forEach(function (suggestion) {
          if (suggestion.substring(suggestion.length - 1) === '.') {
            suggestion = suggestion.substring(0, suggestion.length - 1)
          }
          suggest += '. ' + suggestion
        })

        inputHelper.innerHTML = suggest.substring(2) + '.'
      }

      return null
    }

    return target.value
  },

  comparePasswords: function (target) {
    var password = document.getElementById(target.id.substring(0, target.id.length - 1))
    var inputHelper = document.getElementById(target.id + '_helper')

    // Reset element
    target.classList.remove('invalid')
    inputHelper.classList.remove('invalid')
    inputHelper.innerHTML = ''

    if (target.value !== password.value) {
      inputHelper.classList.add('invalid')
      target.classList.add('invalid')
      inputHelper.innerHTML = 'The passwords do not match.'

      return null
    }

    return target.value
  }
}
