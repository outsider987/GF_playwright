import { app, BrowserWindow, crashReporter, dialog, ipcMain, screen, shell } from 'electron';
import { chromium } from 'playwright';
import { RegisterFrontendEvents } from './ipcMain';
import { environment } from './config/base';
import { autoUpdater } from 'electron-updater';
import { exec } from 'child_process';
import path from 'path';

let mainWindow: Electron.BrowserWindow | null;

// const server = 'https://vercel.com/outsider987/hazel';
// const url = `${server}/update/${process.platform}/${app.getVersion()}`;

// autoUpdater.setFeedURL({ url });

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'GF_playwright',
    owner: 'outsider987',
    private: false,
    token: process.env.GITHUB_TOKEN,
});

async function createWindow() {
    let display = screen.getPrimaryDisplay();
    let widtho = display.bounds.width * 0.2;
    let heighto = display.bounds.height * 0.8;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: widtho,
        height: heighto,
        titleBarStyle: 'hidden',
        frame: false,
        transparent: true,
        maximizable: false,

        webPreferences: {
            nodeIntegration: true,
            // devTools: true,
            contextIsolation: false,
            sandbox: false,
        },
    });

    if (process.platform === 'darwin') {
        console.log('Running on macOS');
        const extraResourcesPath = path.join(__dirname, '../../', 'cmd', 'mac', 'install-playwright.sh');

        console.log(extraResourcesPath);

        // Execute the shell script using the 'exec' function
        const child = exec(`sh ${extraResourcesPath}`);

        // Capture the output of the shell script
        child.stdout.on('data', (data) => {
            console.log(`Script output: ${data}`);
        });

        // Capture any errors that occur during execution
        child.stderr.on('data', (data) => {
            console.error(`Script error: ${data}`);
        });

        // Execute a callback function when the script execution is complete
        child.on('close', (code) => {
            console.log(`Script execution complete with code ${code}`);
        });
    } else {
        // const extraResourcesPath = path.join(app.getAppPath(), 'windows', 'install-playwright-with-nvm.bat');
        const extraResourcesPath = path.join(__dirname, '../../', 'cmd', 'windows', 'install-playwright-with-nvm.bat');

        console.log(extraResourcesPath);
        const shellScriptPath = extraResourcesPath;
        console.log(shellScriptPath);
        // Execute the shell script using the 'exec' function
        const child = exec(`${shellScriptPath}`);

        // Capture the output of the shell script
        child.stdout.on('data', (data) => {
            console.log(`Script output: ${data}`);
        });

        // Capture any errors that occur during execution
        child.stderr.on('data', (data) => {
            console.error(`Script error: ${data}`);
        });

        // Execute a callback function when the script execution is complete
        child.on('close', (code) => {
            console.log(`Script execution complete with code ${code}`);
        });
    }

    // Load the Playwright page in the Electron window.

    environment.production
        ? mainWindow.loadURL(`file://${__dirname}/frontend/index.html`)
        : mainWindow.loadURL('http://localhost:8080');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    RegisterFrontendEvents(mainWindow);

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    autoUpdater.checkForUpdates().then((data) => {
        console.log(data);
    });
}
console.log(app.getPath('crashDumps'));
crashReporter.start({ submitURL: '', uploadToServer: false });

environment.production && app.commandLine.appendSwitch('no-sandbox');
// app.commandLine.appendSwitch('disable-gpu');
// app.commandLine.appendSwitch('disable-software-rasterizer');
// app.commandLine.appendSwitch('disable-gpu-compositing');
// app.commandLine.appendSwitch('disable-gpu-rasterization');
// app.commandLine.appendSwitch('disable-gpu-sandbox');
// app.commandLine.appendSwitch('--no-sandbox');
// app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// app.disableHardwareAcceleration();
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// app.on('before-quit', () => {
//     try {
//         mainWindow.close();
//     } catch (error) {
//         console.log(error);
//     }
// });

app.on('window-all-closed', function () {
    app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

autoUpdater.on('update-available', (info) => {
    console.log(info);
    console.log('update available');
    if (process.platform === 'darwin') {
        const dialogOpts = {
            type: 'info',
            buttons: ['OK'],
            title: `新的版本${app.getVersion()}`,
            message: `請手動下載${app.getVersion()}.dmg , 下載完畢請到下載項目手動更新`,
            detail: '下載後請手動安裝',
        };

        dialog.showMessageBox(dialogOpts).then((returnValue) => {});

        shell.openExternal(
            `https://github.com/outsider987/GF_playwright/releases/download/v${app.getVersion()}/robot-${app.getVersion()}.dmg`,
        );
    } else {
        mainWindow.webContents.send('update-available');
        const dialogOpts = {
            type: 'info',
            buttons: ['OK'],
            title: `新的版本${app.getVersion()}`,
            message: '請等待更新完畢',
            detail: '更新完後會有新的對話窗出現',
        };

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
                console.log('update');
                autoUpdater.downloadUpdate().catch((err) => console.log(err));
                console.log('updated');
            }
        });
    }
});

autoUpdater.on('update-downloaded', (infor) => {
    console.log('update downloaded');
    const dialogOpts = {
        type: 'info',
        buttons: ['重新啟動'],
        title: 'Application Update',
        message: `${infor}`,
        detail: '以下載最新的版本,請按下重新啟動',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) {
            autoUpdater.quitAndInstall();
            mainWindow.webContents.send('update-available-close');
        }
    });
});

autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
});
