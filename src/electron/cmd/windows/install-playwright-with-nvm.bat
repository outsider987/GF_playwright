@echo off

echo Checking Playwright installation...

npx playwright --version >nul 2>&1

IF %ERRORLEVEL% EQU 0 (
    echo Playwright is already installed.
    pause
    exit /b
)
echo Installing NVM...

curl -o nvm-install.sh https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh


IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install NVM.
    pause
) ELSE (
    echo Successfully installed NVM.
)

echo Exporting NVM to Windows environment...
CALL "%USERPROFILE%\.nvm\nvm.exe" --version >nul 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to export NVM to Windows environment.
    pause
    exit /b
) ELSE (
    echo Successfully exported NVM to Windows environment.
)


echo Installing Node 14...
nvm install 18
nvm use 18

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

npx playwright install-deps

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install Playwright. deps
    pause
) ELSE (
    echo Successfully installed Playwright. deps
    pause
)