import { BrowserWindow, ipcMain } from 'electron';
import { run } from '../../crawler';
import fs from 'fs';
import { configPath } from '../../config/bast';
import { exportPath, routineState } from '../../crawler/config/base';
export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {
    const saveConfigPath = `${configPath.stateConfig}/config.json`;
    const abortController = new AbortController();
    ipcMain.on('routineStart', (event, args) => {
        console.log('routine start ');

        fs.writeFileSync(saveConfigPath, JSON.stringify({ ...args }));
        run({ ...args }, abortController.signal);
    });

    ipcMain.on('routineStop', (event, args) => {
        console.log('routine stop ');

        const configState = JSON.parse(fs.readFileSync(saveConfigPath, 'utf8'));
        fs.writeFileSync(
            saveConfigPath,
            JSON.stringify({ ...configState, globalState: { ...configState.globalState, isRunning: false } }),
        );
        abortController.abort();
    });

    ipcMain.handle('getRoutineState', async (event, args) => {
        if (!fs.existsSync(configPath.stateConfig)) fs.mkdirSync(configPath.stateConfig);
        if (fs.existsSync(saveConfigPath)) {
            const oldState = JSON.parse(fs.readFileSync(saveConfigPath, 'utf8'));
            if (hasNewKeys(oldState.routineState, args.routineState))
                updateObject(oldState.routineState, args.routineState);

            fs.writeFileSync(saveConfigPath, JSON.stringify({ routineState: oldState.routineState }));
            return oldState.routineState;
        } else {
            fs.writeFileSync(saveConfigPath, JSON.stringify({ routineState: args.routineState }));
            return args.routineState;
        }
    });
};
function updateObject(originalObj: any, modifiedObj: any) {
    for (const key of Object.keys(modifiedObj)) {
        if (typeof modifiedObj[key] === 'object' && !Array.isArray(modifiedObj[key])) {
            if (!originalObj.hasOwnProperty(key)) {
                originalObj[key] = {};
            }
            updateObject(originalObj[key], modifiedObj[key]);
        } else {
            originalObj[key] = modifiedObj[key];
        }
    }
}

function hasNewKeys(originalObj: any, modifiedObj: any) {
    const originalKeys = Object.keys(originalObj);
    const modifiedKeys = Object.keys(modifiedObj);
    const newKeys = modifiedKeys.filter((key) => !originalKeys.includes(key));

    for (const key of originalKeys) {
        const originalValue = originalObj[key];
        const modifiedValue = modifiedObj[key];
        if (typeof originalValue === 'object' && typeof modifiedValue === 'object') {
            if (hasNewKeys(originalValue, modifiedValue)) {
                return true;
            }
        }
    }

    return newKeys.length > 0;
}
