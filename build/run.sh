#!/bin/bash

#
# This script assumes the following:
#
# - You are trying to build on macOS 10.15 (this is for mac and linux builds)
# - You have Docker Desktop installed and is running (this is for windows builds)
# - You have Java install (to sign the windows app)
# - You have a valid Apple Developer certificate in your keychain (to sign the mac app)
# - You have an Apple ID (to notarize the mac app)
# - You have a valid certificate or token for Jsign to use (in order to sign the windows app)
# - You have populated the .env file according to the .env.sample
#

source .env

export GH_TOKEN=$GH_TOKEN

rm -rf dist/*

# Create source archives
git archive -o dist/source.zip --prefix=Enceeper/ HEAD
git archive -o dist/source.tar.gz --prefix=Enceeper/ HEAD

#
# Some notes on docker (v2.1.0.4):
#
# Console: screen ~/Library/Containers/com.docker.docker/Data/vms/0/tty
# Quit: CTRL+A CTRL+\
#

# This part will build the windows executable
# https://www.electron.build/multi-platform-build#build-electron-app-using-docker-on-a-local-machine
docker run --rm -ti \
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v ${PWD}:/project \
 -v ${PWD##*/}-node-modules:/project/node_modules \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine \
 /bin/bash -c "npm install && npx electron-builder --x64 -w --publish never"

# This is the win version zip file
mv dist/Enceeper.zip dist/Enceeper-win.zip

# This part will build for macOS and GNU/Linux
if [ $# -eq 0 ] || [ $1 != "--deploy" ]; then
	npx electron-builder --x64 -ml --publish never
else
	npx electron-builder --x64 -ml -c.extraMetadata.notarize=true --publish always
	# We need to sign the Windows Executable
	# https://www.electron.build/tutorials/code-signing-windows-apps-on-unix#signing-windows-app-on-maclinux-using-jsign
	java -jar build/jsign-2.1.jar --keystore $CS_FILE --storetype PKCS11 --storepass $CS_PASS --alias $CS_NAME \
	 --alg SHA-256 --tsaurl http://timestamp.digicert.com dist/Enceeper.exe
fi

# This is the mac version zip file
mv dist/Enceeper.zip dist/Enceeper-mac.zip
