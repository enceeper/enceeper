//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// User related helper functions
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

const helpers = require('./helpers.js')

module.exports = {
  changeUser: function (target) {
    var x = document.getElementById('email')
    var y = document.getElementById('registerAction')

    // Fix username
    x.removeAttribute('disabled')
    x.value = ''
    x.focus()

    // Hide button
    target.classList.add('hide')
    // Show register button
    y.classList.remove('hide')
  },

  showRegister: function () {
    var x = document.getElementById('loginform')
    var y = document.getElementById('registerform')
    var email = document.getElementById('emailr')

    helpers.setTitle('Register')

    helpers.clearInputElements(y)
    helpers.swapUIElements(x, y, function () {
      email.focus()
    })
  },

  showLogin: function () {
    var x = document.getElementById('loginform')
    var y = document.getElementById('registerform')
    var email = document.getElementById('email')

    helpers.setTitle('Login')

    helpers.clearInputElements(x)
    helpers.swapUIElements(y, x, function () {
      email.focus()
    })
  },

  prepareLoginForm: function () {
    var emailElem = document.getElementById('email')
    var emailLabel = helpers.getNextSibling(emailElem)
    var passwordElem = document.getElementById('password')
    var changeuserElem = $('#changeuser')
    var registerElem = $('#registerAction')
    var email

    // Fix password visibility
    helpers.togglePasswordVisibility(helpers.getPreviousSibling(passwordElem), true)

    if (!changeuserElem.hasClass('hide')) {
      changeuserElem.addClass('hide')
    }
    if (registerElem.hasClass('hide')) {
      registerElem.removeClass('hide')
    }
    emailElem.disabled = false

    // Do we have the email locally stored?
    email = global.store.get('email')
    if (typeof email !== 'undefined') {
      // Make the label active
      emailLabel.classList.add('active')
      // Prepare the element
      emailElem.value = email
      emailElem.disabled = true
      // Prepare the buttons
      changeuserElem.removeClass('hide')
      registerElem.addClass('hide')

      return passwordElem
    } else {
      return emailElem
    }
  },

  isLogged: function () {
    var main = $('#main')

    return (main.length === 1 && !main.hasClass('hide'))
  },

  logout: function () {
    var emailElem = document.getElementById('email')
    var passwordElem = document.getElementById('password')
    var titleElem = document.getElementById('cardTitle')
    var main = document.getElementById('main')
    var loginActions = $('#loginActions')
    var unlockActions = $('#unlockActions')

    // Close any open modals
    $('.modal').each(function (index, input) {
      if (input.M_Modal.isOpen) {
        $('#' + input.id).modal('close')
      }
    })

    // Reset internal vars
    global.enc = null
    global.sidenav = null

    // Fix login form
    titleElem.innerHTML = 'Login'
    emailElem.value = ''
    passwordElem.value = ''

    if (loginActions.hasClass('hide')) {
      loginActions.removeClass('hide')
    }
    if (!unlockActions.hasClass('hide')) {
      unlockActions.addClass('hide')
    }

    helpers.setTitle('Login')

    helpers.swapUIElements(
      main,
      document.getElementById('intro'),
      function () {
        main.remove()
        module.exports.prepareLoginForm().focus()
      }
    )
  }
}
