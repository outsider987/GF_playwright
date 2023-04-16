import { app, BrowserWindow, crashReporter, screen } from 'electron';
import * as path from 'path';
import { chromium } from 'playwright';
import { RegisterFrontendEvents } from './ipcMain';

let mainWindow: Electron.BrowserWindow | null;

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

    mainWindow.loadURL('http://localhost:8080');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    RegisterFrontendEvents(mainWindow);

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
console.log(app.getPath('crashDumps'));
crashReporter.start({ submitURL: '', uploadToServer: false });
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.disableHardwareAcceleration();
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
        // app.quit();
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
