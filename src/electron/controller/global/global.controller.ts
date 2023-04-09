import { BrowserWindow, ipcMain } from 'electron';

export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {
    ipcMain.handle('closeWindow', (event) => {
        // const window = BrowserWindow.getFocusedWindow();
        mainWindow.removeAllListeners('close');
        mainWindow.close();
    });
};
