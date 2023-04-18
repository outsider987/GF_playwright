import { BrowserWindow, app, ipcMain } from 'electron';
import { run } from '../../crawler';
import fs from 'fs';
import { configPath } from '../../config/bast';
import { exportPath, routineState } from '../../crawler/config/base';
import path from 'path';
export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {
    const documentsPath = app.getPath('documents');
    const baseSaveConfigPath = `${configPath.stateConfig}/config.json`;
    const dirPath = path.join(documentsPath, configPath.stateConfig);
    const filePath = path.join(documentsPath, baseSaveConfigPath);

    ipcMain.handle('saveGlobalState', async (event, args) => {
        console.log('saveGlobalState start ');
        const filePath = path.join(documentsPath, baseSaveConfigPath);
        await fs.writeFileSync(filePath, JSON.stringify({ ...args }));
    });

    ipcMain.handle('getGlobalState', async (event, globalState) => {
        if (await fs.existsSync(filePath)) {
            const oldState = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (hasNewKeys(oldState.globalState, globalState)) updateObject(oldState.globalState, globalState);

            await fs.writeFileSync(baseSaveConfigPath, JSON.stringify({ globalState: oldState.routineState }));
            return oldState.globalState;
        } else {
            fs.mkdirSync(dirPath, { recursive: true });
            await fs.writeFileSync(filePath, JSON.stringify({ globalState: globalState }));
            return globalState;
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
