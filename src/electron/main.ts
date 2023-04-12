import { app, BrowserWindow, screen } from 'electron';
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
            devTools: true,
            contextIsolation: false,
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
    const dragArea = document.getElementById('header');

    dragArea.addEventListener('mousedown', (event) => {
        if (event.button !== 0) {
            // Only allow dragging with the left mouse button
            return;
        }
        // When the user clicks on the draggable area, start dragging the window
        mainWindow.webContents.on('before-input-event', () => false);
        mainWindow.setIgnoreMouseEvents(true, { forward: true });

        const { screenX, screenY } = event;
        const currentPosition = mainWindow.getPosition();
        const offset = { x: screenX - currentPosition[0], y: screenY - currentPosition[1] };
        const handleMouseMove = (event: { screenX: any; screenY: any }) => {
            const { screenX, screenY } = event;
            const x = screenX - offset.x;
            const y = screenY - offset.y;
            mainWindow.setPosition(x, y);
        };
        const handleMouseUp = () => {
            mainWindow.webContents.removeListener('before-input-event', () => false);
            mainWindow.setIgnoreMouseEvents(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });
}

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
