import { app, autoUpdater, BrowserWindow, crashReporter, dialog, screen } from 'electron';
import { chromium } from 'playwright';
import { RegisterFrontendEvents } from './ipcMain';
import { environment } from './config/bast';

let mainWindow: Electron.BrowserWindow | null;

// const server = 'https://github.com/outsider987/GF_playwright';
// const url = `${server}/update/${process.platform}/${app.getVersion()}`;

// autoUpdater.setFeedURL({ url });

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
    setInterval(() => {
        autoUpdater.checkForUpdates();
    }, 1000);
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

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q.
app.on('before-quit', () => {
    try {
        const window = BrowserWindow.getFocusedWindow();
        window.close();
    } catch (error) {
        console.log(error);
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the
    // app when the dock icon is clicked and there are no
    // other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

autoUpdater.on('update-available', (_event: any, _releaseNotes: any, _releaseName: any) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['OK'],
        title: 'Application Update',
        message: 'A new version is available',
        detail: 'A new version is available. Do you want to update now?',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) {
            console.log('update');
            // autoUpdater.downloadUpdate();
        }
    });
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
});
