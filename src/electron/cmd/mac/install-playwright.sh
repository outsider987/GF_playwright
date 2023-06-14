#!/bin/bash

echo Installing Homebrew...
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo export brew path...
cd /opt/homebrew/bin/
PATH=$PATH:/opt/homebrew/bin

echo install nvm 
brew install nvm 

echo export nvm path...
export NVM_DIR="$HOME/.nvm" 


echo Installing stable Node.js...
source ~/.bashrc
nvm install 16

echo Installing Playwright...
npm install -g playwright

# if [ $? -ne 0 ]; then
#     echo Failed to install Playwright.
#     exit 1
# else
#     echo Successfully installed Playwright.
#     exit 0
# fi

echo install playwright dependencies...
npx playwright install 
# if [ $? -ne 0 ]; then
#     echo Failed to install Playwright dependencies.
#     exit 1
# else
#     echo Successfully installed Playwright dependencies.
#     exit 0
# fi
```