//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Display the plan details
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

module.exports = {
  viewPlan: function () {
    var title = document.getElementById('infoTitle')
    var details = document.getElementById('infoDetails')
    var keys = Object.keys(global.enc._plan)
    var lines = ''
    var ctaButton = '<p class="center-align"><a class="waves-effect waves-light btn teal" onClick="app.webAuth()"><i class="material-icons left">public</i>Change plan</a></p>'

    keys.forEach(function (key) {
      var translation = ''
      var value, xtrastyle

      if (key === 'key_sharing') {
        translation = 'Allow sharing?'
      } else if (key === 'key_size_bytes') {
        translation = 'Vault entry size (in bytes)'
      } else if (key === 'name') {
        translation = 'Name'
      } else if (key === 'reqs_per_hour') {
        translation = 'Requests per hour'
      } else if (key === 'slot_approve_use') {
        translation = 'Allow approve first (slot)?'
      } else if (key === 'slot_notify_on_use') {
        translation = 'Allow notify on use (slot)?'
      } else if (key === 'slots_per_key') {
        translation = 'Slots per entry'
      } else if (key === 'total_keys') {
        translation = 'Total entries'
      } else if (key === 'price_in_usd') {
        translation = 'Price per year (in US dollars)'
      }

      if (translation.length === 0) {
        return
      }

      xtrastyle = ''
      value = global.enc._plan[key].toString()
      if (value === 'true') {
        xtrastyle = ' style="padding-bottom: 5px;"'
        value = '<i class="material-icons">check</i>'
      } else if (value === 'false') {
        xtrastyle = ' style="padding-bottom: 5px;"'
        value = '<i class="material-icons">close</i>'
      }

      lines += '<tr><td>' + translation + '</td><td' + xtrastyle + '>' + value + '</td></tr>'
    })

    title.innerHTML = 'Plan details'
    details.innerHTML = ctaButton + '<table><thead><tr><th>Title</th><th>Value</th></tr></thead><tbody>' + lines + '</tbody></table>' + ctaButton

    $('#infoModal').modal('open')
  }
}
