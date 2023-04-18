#!/bin/bash

echo Installing Homebrew...
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo Installing NVM...
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

echo Installing stable Node.js...
source ~/.bashrc
nvm install --lts

echo Installing Playwright...
npx install playwright

if [ $? -ne 0 ]; then
    echo Failed to install Playwright.
    exit 1
else
    echo Successfully installed Playwright.
    exit 0
fi