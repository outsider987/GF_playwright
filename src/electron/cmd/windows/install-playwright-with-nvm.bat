@echo off
echo Installing NVM...

curl -o nvm-install.sh https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh


IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install NVM.
    pause
) ELSE (
    echo Successfully installed NVM.
)



echo Installing Node 14...
nvm install 14
nvm use 14

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install node 14 version.
    pause
) ELSE (
    echo Successfully installed node 14 version.
)

echo Installing Playwright...

npx playwright install 

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install Playwright.
    pause
) ELSE (
    echo Successfully installed Playwright.
    pause
)