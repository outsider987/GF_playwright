import { BrowserWindow, ipcMain } from 'electron';
import { run } from '../../crawler';
import fs from 'fs';
import { configPath } from '../../config/bast';
import { exportPath, initialRoutineState } from '../../crawler/config/base';
export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {
    ipcMain.on('routineStart', (event, args) => {
        console.log('routine start ');
        const { mode } = args;
        run(mode);
    });

    ipcMain.handle('getRoutineState', async (event, args) => {
        if (!fs.existsSync(configPath.stateConfig)) fs.mkdirSync(configPath.stateConfig);
        if (fs.existsSync(`${configPath.stateConfig}/config.json`))
            return JSON.parse(fs.readFileSync(`${configPath.stateConfig}/config.json`, 'utf8'));
        else {
            fs.writeFileSync(`${configPath.stateConfig}/config.json`, JSON.stringify(initialRoutineState));
            return initialRoutineState;
        }
    });
};
