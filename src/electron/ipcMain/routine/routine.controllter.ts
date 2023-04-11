import { BrowserWindow, ipcMain } from 'electron';
import { run } from '../../crawler';

export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {
    ipcMain.handle('routineStart', (event) => {
        console.log('routine start ');

        run();
    });
};
