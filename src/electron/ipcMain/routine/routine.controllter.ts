import { BrowserWindow, app, ipcMain } from 'electron';
import { run } from '../../crawler';
import fs from 'fs';
import { configPath } from '../../config/base';
import path from 'path';
export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {
    const saveConfigPath = `${configPath.stateConfig}/config.json`;
    const routineSettingPath = `${configPath.stateConfig}/routineSetting.json`;
    const documentsPath = app.getPath('documents');
    const statePath = path.join(documentsPath, saveConfigPath);
    const routineSettingDocumentPath = path.join(documentsPath, routineSettingPath);

    ipcMain.on('routineStart', async (event, args) => {
        console.log('routine start ');

        await fs.writeFileSync(statePath, JSON.stringify({ ...args }));
        const isSucess = await run({ ...args });
        mainWindow.webContents.send('rountineEnd', isSucess ? '成功編輯' : '中斷編輯');
    });

    ipcMain.on('routineStop', async (event, args) => {
        console.log('routine stop ');

        const configState = JSON.parse(fs.readFileSync(saveConfigPath, 'utf8'));
        await fs.writeFileSync(
            saveConfigPath,
            JSON.stringify({ ...configState, globalState: { ...configState.globalState, isRunning: false } }),
        );
    });

    ipcMain.handle('getRoutineState', async (event, args) => {
        const routineSetting = JSON.parse(fs.readFileSync(routineSettingDocumentPath, 'utf8'));
        return routineSetting.routine;
    });

    ipcMain.handle('deleteSetting', async (event, args) => {
        const index = args;
        const routineSetting = JSON.parse(fs.readFileSync(routineSettingDocumentPath, 'utf8'));
        routineSetting.routine.splice(index, 1);
        await fs.writeFileSync(routineSettingDocumentPath, JSON.stringify(routineSetting));
    });

    ipcMain.handle('saveRoutineState', async (event, args) => {
        !fs.existsSync(routineSettingDocumentPath) &&
            fs.writeFileSync(routineSettingDocumentPath, JSON.stringify({ routine: [] }));
        const routineSetting = JSON.parse(fs.readFileSync(routineSettingDocumentPath, 'utf8'));
        routineSetting.routine.push(args);
        fs.writeFileSync(routineSettingDocumentPath, JSON.stringify(routineSetting));
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
