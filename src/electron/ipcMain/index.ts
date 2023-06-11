import { BrowserWindow, ipcMain } from 'electron';

import * as fs from 'fs';
import * as path from 'path';

const currentDir = path.join(__dirname);

export const RegisterFrontendEvents = (mainWindow: Electron.BrowserWindow) => {

    importAll(currentDir, mainWindow);
};

function importAll(directory: string, mainWindow: Electron.BrowserWindow) {
    if (path.extname(directory) === '.ts' || path.extname(directory) === '.map') return;
    const fileNames = fs.readdirSync(directory);

    // Loop through all files in the directory
    fileNames.forEach((fileName) => {
        const filePath = path.join(directory, fileName);
        // If the file is a TypeScript module, import all functions from it
        if (path.extname(fileName) === '.js' && fileName !== 'index.js') {
            const module = require(filePath);

            // Import all functions from the module and export them
            Object.keys(module).forEach((key) => {
                exports[key] = module[key];
            });
            module.RegisterFrontendEvents(mainWindow);
        } else if (path.extname(fileName) !== '.js') {
            importAll(filePath, mainWindow);
        }
    });
}
