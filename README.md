# Enceeper

Enceeper is a cross-platform password manager, built on top of Electron and utilizing the [Enceeper Service](https://www.enceeper.com/). The Enceeper App performs all cryptography related calculations on your local device, before being send to the Enceeper Service. The Enceeper Service is only storing encrypted representations of your data, so it is not possible by our team or anyone else to reverse this process and view your unencrypted information.

> Your secrets remain truly yours!

## Table of contents

1. [Creating an account](#creating-an-account)
2. [Managing your vault](#managing-your-vault)
    - [Understanding categories](#understanding-categories)
    - [New entry](#new-entry)
    - [Managing an entry](#managing-an-entry)
    - [Keyboard shortcuts](#keyboard-shortcuts)
    - [Search](#search)
    - [Importing CSV](#importing-csv)
3. [Other functionality](#other-functionality)
    - [Viewing and upgrading your plan](#viewing-and-upgrading-your-plan)
    - [Settings](#settings)
    - [Offline usage](#offline-usage)
4. [Technical details](#technical-details)
    - [Encryption](#encryption)
    - [User authentication](#user-authentication)
    - [The need for slots](#the-need-for-slots)
    - [Building from source](#building-from-source)

## Creating an account

Your master password is of utmost importance, so it must never leave your device. Your master password is needed in two occasions:

- When registering: in order to create your account and establish the authentication parameters.
- When authenticating: in order to verify your identity and provide the encrypted vault.

This means that both the registration and authentication procedures must be performed locally in your device from within the App. To get started [download](https://www.enceeper.com/#download) and open the Enceeper App.

Both the registration and authentication procedures are pretty straight forward: both only ask for your email and your master password. The registration procedure involves an additional step, where you are required to validate the email your provided. Please follow the instructions that are emailed to you, in order to complete the registration and be able to utilize your account.

## Managing your vault

When you enter the App the following screen appears (without the entries in the example):

![Enceeper App Main Window](/screenshots/main.png)

The screen is divided into three sections:

- Section A: the main navigation bar (for details see [below](#other-functionality))
- Section B: the list of entries in your vault
- Section C: the available slots in a single entry

Now let's dive into each point on the image above:

1. This checkbox allows you to enable or disable a single entry. When an entry is disabled it cannot be used via API calls and is not available to users you have shared this entry with.
2. Like above this is a status checkbox, but now for individual slots.
3. Will pop-up a menu with more options to [manage a single entry](#managing-an-entry).
4. Is available to entries with additional slots and can be used to expand or contract them.
5. The slider can be used to set how this slot will behave when accessed (this only applies when utilizing the ["Get specific key" API call](https://github.com/enceeper/enceeper-apidoc/blob/master/other.md#get-specific-key)). For example when the Enceeper App is used in conjunction with our [PHP package](https://github.com/enceeper/enceeper-phpconf) or a third party integration.
6. An indicator showing that the contents of the slot will be provided only after being approved (an approval email will be delivered to your inbox).
7. An indicator showing that the contents of the slot will be provided directly.
8. An indicator showing that the contents of the slot will be provided directly, but a notification email will be delivered to your inbox.
9. This button will copy the identifier of the slot to the clipboard (this is to be used in the ["Get specific key" API call](https://github.com/enceeper/enceeper-apidoc/blob/master/other.md#get-specific-key)).
10. Will allow you to update the password that was used to encrypt this slot.
11. Will delete the slot.

### Understanding categories

Categories are ways to group your vault entries. For each entry you can define one or more category tags. The Enceeper App gathers all of the tags from all entries in your vault and builds a category list, making this list available on the left side of the App. When you select a category the App will filter the results in order to only display the relevant entries. So categories can be used to group entries in collections. Keep in mind that a single entry can appear in multiple categories, as we can have multiple tags defined in an entry.

![Enceeper App Categories](/screenshots/categories.png)

### New entry

Adding a new entry is pretty straight forward: you provide the necessary information and click "Save". A few details:

* Only the title, password and categories fields are required.
* If you want to store in the password field a multi-line text, use the toggle button below the field (see point 1).
* You can use the password generator (see point 2) to easily create a random password for your new entry.
* Do not forget to hit enter in the "Categories" field in order for your text to be converted to a tag (see point 3).

![Enceeper App Password Entry](/screenshots/password-entry.png)

The password generator allows you to set specific criteria (the characters, length or [entropy](https://en.wikipedia.org/wiki/Password_strength#Entropy_as_a_measure_of_password_strength)) in order to generate a completely random password. The available fields are displayed in the image below.

![Enceeper App Password Generator](/screenshots/generator.png)

### Managing an entry

You can manage your existing entries in the following ways:

1. Create an additional slot for this entry (this is to be used in the ["Get specific key" API call](https://github.com/enceeper/enceeper-apidoc/blob/master/other.md#get-specific-key)).
2. Edit the contents of the entry (just read the above paragraph).
3. Share an entry with another user of the Enceeper Service (via their email).
4. Delete the entry.
5. For managing the slots of an entry see above the [managing your vault](#managing-your-vault) section.

![Enceeper App Entry Actions](/screenshots/password-popup.png)

### Keyboard shortcuts

There are 3 keyboard shortcuts available in the App when you are in the main window:

- You can hit ⌘ Cmd+N or Ctrl+N to create a new entry
- When you have selected an entry (by clicking on it) you can:
    1. Copy the username by hitting ⌘ Cmd+B or Ctrl+B, and
    2. Copy the password by hitting ⌘ Cmd+D or Ctrl+D

In order to copy the username you can also double click the username of an entry (see point 1), and to copy the password you can double click the key icon (see point 2).

Once a username or a password is copied a notification message will appear in the App to provide feedback, as displayed below.

![Enceeper App Clipboard](/screenshots/copy-user-pass.png)

### Search

To search inside your vault click on the magnifying glass and the search bar will appear (see point 1). Start typing some characters and the App will return the matching entries in your vault automatically. You can clear the search results by clicking on the X icon inside the search bar (see point 2 below).

![Enceeper App Search](/screenshots/search.png)

### Importing CSV

If you are already using a password manager, you can migrate your existing passwords to Enceeper by using the import functionality. You will need to perform the following steps:

1. Understand what a [comma-separated values (CSV)](https://en.wikipedia.org/wiki/Comma-separated_values) file is
2. Export your data from your existing password manager to a CSV file
3. Open the CSV file with a spreadsheet application or text editor to make sure that everything is OK (see below)
4. Use the "Import from CSV..." menu item under the "Tools" menu to import the data to the Enceeper App

The Enceeper App is expecting the CSV file to be in the following format:

```
"Group","Title","Username","Password","URL","Notes"
"Website","Sample Entry","User Name","Password","http://www.example.com/","Notes"
```

The first line of the CSV file must contain the title of each field (we do not care about the order of appearance) and the remaining lines to contain the actual data. All fields are required and must have the value described in the example. The group field will be used as a category tag.

## Other functionality

The navigation bar on the top of the App offers (as displayed in the image below) the following functionality:

1. The hamburger button is available on small screens and can be used to toggle the categories menu.
2. You can view the category that is currently selected in this section.
3. The user pop-up menu provides additional functionality for your account.
4. This button can be used to lock the Enceeper App.

![Enceeper App User Menu](/screenshots/user-popup.png)

### Viewing and upgrading your plan

Selecting "View plan details" from the user pop-up menu will provide you with details about your current plan. Also a button is available (see point 1) that will transfer you to your account in the Enceeper Service. From there you can view your current plan and change to a different plan.

![Enceeper App Plan Details](/screenshots/plan.png)

### Settings

Selecting "Settings" from the user pop-up menu will display the settings of the App. You can define the following there:

- Select the first option if you want the App to remember your email during startup
- The second option instructs the App to clear the clipboard after a copy (username or password) and how many seconds to wait before clearing it
- The third option instructs the App to lock the database automatically and how many minutes to wait before locking it

![Enceeper App Settings](/screenshots/settings.png)

### Offline usage

Your data are automatically synced to our infrastructure and there is no need for you to backup anything. If you want to access your account from another device, simply install the Enceeper App and login. The application with fetch a fresh copy of your encrypted information from our cloud servers.

If you are having network problems or our infrastructure is facing a downtime you can use the Enceeper App in offline mode. The application automatically stores your data locally to your device encrypted, in order to facilitate the offline functionality.

## Technical details

The Enceeper App is using the [Enceeper Service](https://www.enceeper.com/) in the following way:

- All data are first encrypted locally and then transmitted over the network.
- The password of the user is never transmitted, but is used locally to compute a proof-of-knowledge.
- Moreover, a user has the option to "share" those secrets with other users of the service by adding slots to selected entries.
- Finally, any third party can use the [API of the service](https://github.com/enceeper/enceeper-apidoc) to enhance the core functionality.

### Encryption

The Enceeper Service does not hold plain text versions of your passwords. Everything is encrypted locally on your device using end-to-end encryption before being transmitted. On top of that we utilize HTTPS as an additional layer of security and privacy. The following algorithms and procedures are used to secure your account and encrypt the information we store in order to provide the required functionality (via the SJCL and TweetNaCl cryptographic libraries):

- We utilize the following algorithms: scrypt (altered to use the SHA512 hash function), AES256, SHA512, CCM mode (Counter with CBC-MAC)
- For key sharing we additionally use: Curve25519-XSalsa20-Poly1305 (public-key authenticated encryption)
- Your master password is used to derive (via scrypt) the Master Encryption Key (MEK)
- When creating your account a random Key Encryption Key (KEK) is created
- The MEK is only used to encrypt/decrypt the KEK
- The KEK is the base key used to encrypt/decrypt the other keys in your vault
- Each entry in your vault is encrypted with a random key (created on the spot) and the KEK is used to encrypt/decrypt this random key
- The KEK is also used to encrypt/decrypt your private key that is used for key sharing (public-key encryption scheme)

We utilize state-of-the-art encryption primitives and especially [authenticated encryption](https://en.wikipedia.org/wiki/Authenticated_encryption) to assure the confidentiality and authenticity of your data.

> If the information above is overwhelming do not worry, the Enceeper App hides all this complexity under the hood. The end result is a user friendly, easy to use and secure password manager.

### User authentication

Since the master password you chose at registration time is used during the encryption process above (although indirectly), it is vital that it is never sent or stored on the server in an easily crackable form. To help with this goal, Enceeper uses the Secure Remote Passwords (SRP6a) encrypted key exchange protocol. This protocol belongs to a family of password-authenticated key agreement (PAKE) methods that are designed to allow a user to perform identification without revealing any information about the password.

SRP is an interactive protocol which allows a server to confirm that some client knows a password (proof-of-knowledge), and to derive a strong shared session key, without revealing what the password is to an eavesdropper. In addition, the server does not hold the actual password: instead it stores a "verifier" created by the client. If the server’s private data is revealed (by a server compromise), the verifier cannot be used directly to impersonate the client.

### The need for slots

Slots are ways to access your passwords, so for each one of your passwords there is one or more slots associated with it. The first slot is automatically created and is used by your account to access your password. Each time you request another way to access a specific password an additional slot is created (when you manually add a slot or when sharing a password). Removing those slots will revoke access to this password, but keep in mind that if the other party has cached the password you will also need to change the password itself. **Preferably delete the entry from your vault and create a new entry with a fresh password.**

In detail every entry in your vault is encrypted using a different random key. This level of fidelity is important if you want to securely share individual entries in your vault with other users. Even if a user that you shared a key with manages to receive your encrypted vault, she cannot decrypt or access anything else. This is because when accessing a specific entry (you or someone else) you access it via it's unique random key.

So slots are encrypted representations of the random key mentioned above with different access keys (for example your access key and the user's access key that you selected to share this key with).

### Building from source

I order to **run** Enceeper from source you will need to:

- Get a copy of the source code (this repo)
- Install [Node.js](https://nodejs.org/en/download/) (npm is installed with Node.js)
- Install [Electron](https://electronjs.org/) and other dependencies via npm (`npm install`)
- Run `npm start`

Now if you also want to **build** from source you will need:

- Apple hardware - [or not?](https://techsviewer.com/install-macos-10-15-catalina-on-virtualbox-on-windows-pc/) (macOS Code Signing works only on macOS),
- since macOS Catalina dropped support for 32-bit apps ([wine](https://www.winehq.org/) is not working) you will need [Docker](https://www.docker.com/products/docker-desktop) to build for Windows on macOS,
- follow the instructions inside the `build/run.sh` script (this script was tested only on macOS)

Useful commands:

- `npm install`: will install the Enceeper dependencies
- `npm start`: will run the Enceeper app from source
- `npm run build`: will build the binaries, but do not notarize or sign the app binaries
- `npm run deploy`: will build the binaries and also notarize and sign the app binaries
