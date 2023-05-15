@echo off
echo Installing NVM...

curl -o nvm-install.sh https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh


IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install NVM.
    pause
) ELSE (
    echo Successfully installed NVM.
)

echo Installing Node.js...

nvm install node

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install Node.js.
    pause
) ELSE (
    echo Successfully installed Node.js.
)

echo Installing Playwright...

npm install playwright

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install Playwright.
    pause
) ELSE (
    echo Successfully installed Playwright.
    pause
)