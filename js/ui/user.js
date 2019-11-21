//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// User account related functionality
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

const safeCompare = require('safe-compare')
const enceeper = require('enceeper-jslib')
const helpers = require('../helpers.js')
const uicommon = require('./common.js')
const main = require('./main.js')
const user = require('../user.js')
const validate = require('../validate.js')
const config = require('../config.js')

let lockOpenModal

module.exports = {
  register: function () {
    var passwordElem = document.getElementById('passwordr')
    var password2Elem = document.getElementById('passwordr2')
    var termsElem = document.getElementById('terms')
    var termsHelper = document.getElementById('terms_helper')
    var terms = 'accepted'

    // Reset element
    termsElem.classList.remove('invalid')
    termsHelper.classList.remove('invalid')
    termsHelper.innerHTML = ''

    if (!termsElem.checked) {
      terms = null

      termsElem.classList.add('invalid')
      termsHelper.classList.add('invalid')
      termsHelper.innerHTML = 'You must accepts the terms of the service.'

      termsElem.focus()
    }

    var password2 = validate.comparePasswords(password2Elem)
    if (password2 === null) {
      password2Elem.focus()
    }

    var password = validate.checkPasswordStrength(passwordElem)
    if (password === null) {
      passwordElem.focus()
    }

    var email = validate.inputEmail('emailr')

    if (password !== null && password2 !== null && terms !== null && email !== null) {
      // eslint-disable-next-line
      global.enc = new enceeper.app(email, password)

      uicommon.openSpinner()

      setTimeout(function () {
        global.enc.register(function () {
          uicommon.closeSpinner()
          user.showLogin()
          uicommon.showOkMessage('Please check your emails to confirm your registration!')
        }, uicommon.reportFailure)
      }, config.WAIT_FOR_SPINNER)
    }

    return false
  },

  login: function () {
    var passwordElem = document.getElementById('password')
    var password = validate.inputRequired('password', false, 'You must provide your password.')
    var email = validate.inputEmail('email')
    var unlockActions = $('#unlockActions')

    if (password !== null && email !== null) {
      // Make password hidden
      helpers.togglePasswordVisibility(helpers.getPreviousSibling(passwordElem), true)

      if (unlockActions.hasClass('hide')) {
        // Case #1: We are logging the user
        // eslint-disable-next-line
        global.enc = new enceeper.app(email, password)

        uicommon.openSpinner()
        global.enc.signin(function (data) {
          // Check if we can store the email of the user
          var keepSettings = global.store.get('keep')
          if (typeof keepSettings === 'undefined' || keepSettings === true) {
            global.store.set('email', email)
          }

          global.updateStamp = new Date()
          // Store it in the local cache
          global.store.set('cache', global.enc.getForCache())

          helpers.setTitle(email)
          main.showMain()

          // Check for new App version
          uicommon.checkVersionsAndReport(data)
        }, function (status, errorMessage) {
          // This is a network or server failure, try using the cache
          if (status === 0 || status >= 500) {
            var cache = global.store.get('cache')
            if (cache) {
              uicommon.showWarningMessage('Signin error, trying the local cache...')

              setTimeout(function () {
                try {
                  global.enc.restoreCache(cache)

                  helpers.setTitle(email)
                  main.showMain()
                } catch (e) {
                  passwordElem.value = ''
                  passwordElem.focus()

                  uicommon.closeSpinner()
                  uicommon.showErrorMessage('Decryption failure. Is the password correct?')
                }
              }, config.WAIT_FOR_SPINNER)

              return
            }
          }

          passwordElem.value = ''
          passwordElem.focus()

          uicommon.reportFailure(status, errorMessage)
        })
      } else {
        // Case #2: We are unlocking the database
        if (safeCompare(password.normalize('NFKC'), global.enc._api._pass)) {
          helpers.setTitle(email)

          helpers.swapUIElements(
            document.getElementById('intro'),
            document.getElementById('main'),
            function () {
              // Restore closed modal
              if (lockOpenModal !== null) {
                $('#' + lockOpenModal).modal('open')
              }
            }
          )
        } else {
          passwordElem.value = ''
          passwordElem.focus()
          uicommon.showErrorMessage('Password verification failed. Please retry.')
        }
      }
    }

    return false
  },

  lock: function () {
    var emailElem = document.getElementById('email')
    var passwordElem = document.getElementById('password')
    var titleElem = document.getElementById('cardTitle')
    var changeuserElem = $('#changeuser')
    var loginActions = $('#loginActions')
    var unlockActions = $('#unlockActions')

    // Close the modal and save its name
    lockOpenModal = null
    $('.modal').each(function (index, input) {
      if (input.M_Modal.isOpen) {
        lockOpenModal = input.id
        $('#' + lockOpenModal).modal('close')
      }
    })

    // Fix password visibility
    helpers.togglePasswordVisibility(helpers.getPreviousSibling(passwordElem), true)

    titleElem.innerHTML = 'Unlock'
    emailElem.disabled = true
    passwordElem.value = ''

    if (!changeuserElem.hasClass('hide')) {
      changeuserElem.addClass('hide')
    }
    if (!loginActions.hasClass('hide')) {
      loginActions.addClass('hide')
    }
    if (unlockActions.hasClass('hide')) {
      unlockActions.removeClass('hide')
    }

    helpers.setTitle('Locked')

    helpers.swapUIElements(
      document.getElementById('main'),
      document.getElementById('intro'),
      function () {
        passwordElem.focus()
      }
    )
  },

  // Prepare and show the password modal (master password)
  updatePassword: function () {
    var passwordModal = $('#passwordModal')
    var passwordForm = passwordModal.find('form')[0]
    var passwordElem = passwordModal.find('#passwordo')[0]

    // Reset the form
    passwordForm.reset()
    // Reset all helper texts
    passwordModal.find('.helper-text').each(function (index, input) {
      input.classList.remove('invalid')
      input.innerHTML = ''
    })

    // Now open the modal
    passwordModal.modal('open')

    // We focus via timeout in order for the drop-down menu to close
    setTimeout(function () {
      passwordElem.focus()
    }, config.FOCUS_TIMEOUT)
  },

  // Update the account password (master password)
  passwordConfirmed: function () {
    var passwordElemOld = document.getElementById('passwordo')
    var passwordElem = document.getElementById('passwordu')
    var password2Elem = document.getElementById('passwordu2')
    var safeEquals1 = false
    var safeEquals2 = false

    var password2 = validate.comparePasswords(password2Elem)
    if (password2 === null) {
      password2Elem.focus()
    }

    var password = validate.checkPasswordStrength(passwordElem)
    if (password === null) {
      passwordElem.focus()
    }

    var passwordOld = validate.inputRequired('passwordo', false, 'You must provide your password.')
    if (passwordOld !== null) {
      safeEquals1 = safeCompare(passwordOld.normalize('NFKC'), global.enc._api._pass)
    }
    if (password !== null) {
      safeEquals2 = safeCompare(password.normalize('NFKC'), global.enc._api._pass)
    }

    // Verify with current password
    if ((passwordOld !== null && !safeEquals1) || safeEquals2) {
      var inputHelper = document.getElementById('passwordo_helper')

      passwordElemOld.classList.add('invalid')
      inputHelper.classList.add('invalid')
      if (safeEquals2) {
        inputHelper.innerHTML = 'The old and the new password are the same!'
        passwordElem.focus()
      } else {
        inputHelper.innerHTML = 'Password verification failed. Please retry.'
        passwordElemOld.focus()
      }

      passwordOld = null
    }
    // --

    if (password !== null && password2 !== null && passwordOld !== null) {
      uicommon.openSpinner()

      setTimeout(function () {
        global.enc.password(passwordOld, password, function () {
          uicommon.closeSpinner()
          $('#passwordModal').modal('close')
          uicommon.showOkMessage('Password updated successfully!')
        }, uicommon.reportFailure)
      }, config.WAIT_FOR_SPINNER)
    }

    return false
  },

  // Open the web browser with an auth token
  webAuth: function () {
    uicommon.openSpinner()

    global.enc.webAuth(function (data) {
      uicommon.closeSpinner()
      uicommon.openLink(data)
    }, uicommon.reportFailure)
  }
}
