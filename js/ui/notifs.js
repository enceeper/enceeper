//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// View requests and accept or reject shared passwords
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
const uicommon = require('./common.js')
const main = require('./main.js')
const wrapper = require('../wrapper.js')

// Remove the HTML element that contains that share entry (shares table)
function removeShareEntry (target) {
  target.parentNode.parentNode.remove()
}

module.exports = {
  // The notifications modal (shares inbox)
  viewNotifications: function () {
    module.exports.populateNotifications()

    $('#notifModal').modal('open')
  },

  populateNotifications: function () {
    var notifs = ''

    for (var i = 0; i < global.enc._shares.length; i++) {
      var share = global.enc._shares[i]
      var d = new Date(0)
      var timestamp
      var details
      var aaction
      var kdetails

      d.setUTCSeconds(share.created_on)
      timestamp = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      if (share.from !== null) {
        details = 'From: ' + share.from
        aaction = ''
      } else {
        details = 'To: ' + share.to
        aaction = 'hide'

        kdetails = wrapper.getTitle(global.enc.getKeyDetails(share.key_id).meta)
        if (kdetails !== null) {
          details += ', ' + kdetails
        }
      }

      notifs += global.shareEntry.replace('%TIMESTAMP%', timestamp)
        .replace('%DETAILS%', helpers.escapeHtml(details))
        .replace('%ACCEPT_ACTION%', aaction)
        .replace(new RegExp('%ID%', 'g'), share.share_id)
    }

    document.getElementById('notifTable').innerHTML = notifs
    $('.tooltipped-s').tooltip()
  },

  acceptShare: function (id, target) {
    uicommon.openSpinner(200)

    global.enc.acceptShare(id, function (data) {
      main.populateCategories()
      main.updateKeys()

      uicommon.updateBadges()
      removeShareEntry(target)

      uicommon.closeSpinner()
    }, uicommon.reportFailure)
  },

  rejectShare: function (id, target) {
    uicommon.openSpinner(200)

    global.enc.deleteShare(id, function (data) {
      uicommon.updateBadges()
      removeShareEntry(target)

      uicommon.closeSpinner()
    }, uicommon.reportFailure)
  }
}
