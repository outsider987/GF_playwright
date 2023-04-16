#!/bin/bash
echo Installing Homebrew...

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo Installing Node.js and NPM using Homebrew...

brew install node

echo Installing Playwright...

npx install playwright

if [ $? -ne 0 ]; then
    echo Failed to install Playwright.
    exit 1
else
    echo Successfully installed Playwright.
    exit 0
fi