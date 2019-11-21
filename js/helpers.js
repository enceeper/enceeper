//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// UI helpers
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

/* global $, M */

let prevheight

/** Helper function */
var noop = function () {}

module.exports = {
  getNextSibling: function (elem) {
    do {
      elem = elem.nextSibling
    } while (elem && elem.nodeType !== 1)
    return elem
  },

  getPreviousSibling: function (elem) {
    do {
      elem = elem.previousSibling
    } while (elem && elem.nodeType !== 1)
    return elem
  },

  setTitle: function (title) {
    var titleElem = document.getElementsByTagName('title')[0]

    titleElem.innerHTML = 'Enceeper - ' + module.exports.escapeHtml(title)
  },

  /** Toggle password visibility */
  togglePasswordVisibility: function (target, forceHidden) {
    var x = module.exports.getNextSibling(target)

    forceHidden = forceHidden || false
    if (x.type === 'password' && !forceHidden) {
      x.type = 'text'
      target.innerHTML = 'visibility'
    } else {
      x.type = 'password'
      target.innerHTML = 'visibility_off'
    }
    x.focus()
  },

  /** Activate and deactivate postfix on element focus and blur */
  activatePostfix: function (target) {
    var x = module.exports.getPreviousSibling(target)
    x.classList.add('active')
  },

  deactivatePostfix: function (target) {
    var x = module.exports.getPreviousSibling(target)
    x.classList.remove('active')
  },

  expandSlots: function (target, forceClose) {
    var panel = module.exports.getNextSibling(target.parentNode.parentNode)
    var expand = panel.childNodes[1].childNodes[1]
    var instance = M.Collapsible.getInstance(expand)

    forceClose = forceClose || false
    if (expand.childNodes[1].classList.contains('active')) {
      target.childNodes[0].innerHTML = 'expand_more'
      instance.close(0)
    } else if (!forceClose) {
      target.childNodes[0].innerHTML = 'expand_less'
      instance.open(0)
    }
  },

  swapUIElements: function (x, y, complete, timeA, timeB) {
    var easeA, easeB

    complete = complete || noop
    timeA = timeA || 200
    timeB = timeB || 400
    easeA = easeB = 'swing'

    $(x).animate(
      { opacity: 0.0 },
      timeA,
      easeA,
      function () {
        x.classList.add('hide')
        y.style.opacity = 0.0
        y.classList.remove('hide')

        $(y).animate(
          { opacity: 1.0 },
          timeB,
          easeB,
          function () {
            complete()
          }
        )
      }
    )
  },

  swapInputElements: function (input, targetA, targetB) {
    var elemA = document.getElementById(targetA)
    var elemB = document.getElementById(targetB)
    var gen = input.parentNode.parentNode.parentNode.getElementsByClassName('passgen')[0]

    if (input.checked) {
      elemA.classList.add('hide')
      elemB.classList.remove('hide')
      gen.classList.add('hide')
    } else {
      elemA.classList.remove('hide')
      elemB.classList.add('hide')
      gen.classList.remove('hide')
    }
  },

  // Given a form we clear the input elements
  clearInputElements: function (target) {
    var elements = target.querySelectorAll('input')
    var helpers = target.querySelectorAll('.helper-text')

    elements.forEach(function (item) {
      item.classList.remove('invalid')

      if (item.type === 'checkbox') {
        item.checked = false
      } else {
        item.value = ''

        // Reset password visibility
        if (item.id === 'password' && item.type === 'text') {
          module.exports.togglePasswordVisibility(module.exports.getPreviousSibling(item), true)
        }
      }
    })

    // Remove invalid class from helper elements
    helpers.forEach(function (item) {
      item.classList.remove('invalid')
      item.innerHTML = ''
    })
  },

  enableDropdowns: function (selector) {
    $(selector).dropdown({
      coverTrigger: false,
      constrainWidth: false,
      onOpenStart: function () {
        var x = $('#search')
        x.prop('disabled', true)
        x.next().css('cursor', 'default')
      },
      onCloseEnd: function () {
        var x = $('#search')
        x.prop('disabled', false)
        x.next().css('cursor', 'text')
      }
    })
  },

  fixSidenav: function () {
    var windowHeight = global.mainWindow.height()
    var windowWidth = global.mainWindow.width()
    var tableWidth = windowWidth - 254 // The other TDs + 20 padding

    if (global.sidenav === null) {
      return
    }

    if (windowWidth > 992) {
      windowHeight -= 64
      tableWidth -= 300
    }

    // Fix table widths
    var loopIndex = 0
    $('#kheader').children().each(function () {
      if (loopIndex === 0) {
        this.style.width = '70px'
      } else if (loopIndex === 1 || loopIndex === 2) {
        if (windowWidth <= 700) {
          this.style.width = ((tableWidth / 100) * 50) + 'px'
        } else {
          this.style.width = ((tableWidth / 100) * 30) + 'px'
        }
      } else if (loopIndex === 3) {
        this.style.width = '45px'
      } else if (loopIndex === 4) {
        if (windowWidth <= 700) {
          this.style.width = '0px'
        } else {
          this.style.width = ((tableWidth / 100) * 40) + 'px'
        }
      } else if (loopIndex === 5) {
        this.style.width = '119px'
      }

      loopIndex++
    })

    if (prevheight === windowHeight) {
      return
    }
    prevheight = windowHeight

    global.sidenav.height(windowHeight)
  },

  escapeHtml: function (unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
