import { BrowserWindow, app, ipcMain } from 'electron';
import { run } from '../../crawler';
import fs from 'fs';
import { configPath } from '../../config/base';
import { exportPath, routineState } from '../../crawler/config/base';
import path from 'path';
export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {
    const saveConfigPath = `${configPath.stateConfig}/config.json`;
    const documentsPath = app.getPath('documents');
    const statePath = path.join(documentsPath, saveConfigPath);

    ipcMain.on('downLoadStart', async (event, args) => {
        console.log('routine start ');

        const overWrite = {};
        await fs.writeFileSync(statePath, JSON.stringify({ ...args }));
        const isSucess = await run({ ...args });
        mainWindow.webContents.send('rountineEnd', isSucess ? '成功下載' : '中斷下載');
    });

    ipcMain.handle('getdownloadState', async (event, args) => {});
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
