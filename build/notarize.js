//
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Notarize the App for macOS (based on config and platform details)
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

require('dotenv').config()
const { notarize } = require('electron-notarize')

exports.default = async function notarizing (context) {
  // Do not notarize when just building for debug (notarize on deploy)
  if (!context.packager.info.options.config ||
      !context.packager.info.options.config.extraMetadata ||
      !context.packager.info.options.config.extraMetadata.notarize) {
    return
  }

  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename

  return notarize({
    appBundleId: 'gr.openit.Enceeper',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  })
}
