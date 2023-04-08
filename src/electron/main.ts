import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { chromium } from 'playwright';

let mainWindow: Electron.BrowserWindow | null;

async function createWindow() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://www.example.com');

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Load the Playwright page in the Electron window.
    const url = page.url();
    mainWindow.loadURL(url);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q.
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
