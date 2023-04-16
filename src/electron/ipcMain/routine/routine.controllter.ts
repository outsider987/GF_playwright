import { BrowserWindow, app, ipcMain } from 'electron';
import { run } from '../../crawler';
import fs from 'fs';
import { configPath } from '../../config/bast';
import { exportPath, routineState } from '../../crawler/config/base';
import path from 'path';
export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {
    const saveConfigPath = `${configPath.stateConfig}/config.json`;
    const documentsPath = app.getPath('documents');
    const abortController = new AbortController();

    ipcMain.on('routineStart', async (event, args) => {
        console.log('routine start ');
        const filePath = path.join(documentsPath, saveConfigPath);
        await fs.writeFileSync(filePath, JSON.stringify({ ...args }));
        await run({ ...args }, abortController.signal);
    });

    ipcMain.on('routineStop', async (event, args) => {
        console.log('routine stop ');

        const configState = JSON.parse(fs.readFileSync(saveConfigPath, 'utf8'));
        await fs.writeFileSync(
            saveConfigPath,
            JSON.stringify({ ...configState, globalState: { ...configState.globalState, isRunning: false } }),
        );
        abortController.abort();
    });

    ipcMain.handle('getRoutineState', async (event, args) => {
        if (await fs.existsSync(`${app.getPath('documents')}/saveConfigPath`)) {
            const oldState = JSON.parse(fs.readFileSync(saveConfigPath, 'utf8'));
            if (hasNewKeys(oldState.routineState, args.routineState))
                updateObject(oldState.routineState, args.routineState);

            await fs.writeFileSync(saveConfigPath, JSON.stringify({ routineState: oldState.routineState }));
            return oldState.routineState;
        } else {
            // app.setPath('documents', saveConfigPath)

            const filePath = path.join(documentsPath, saveConfigPath);
            const dirPath = path.join(documentsPath, configPath.stateConfig);
            console.log(dirPath);
            fs.mkdirSync(dirPath, { recursive: true });
            await fs.writeFileSync(filePath, JSON.stringify({ routineState: args.routineState }));
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
