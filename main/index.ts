import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    ipcMain,
    shell,
} from 'electron';

shell.beep();

console.log('Loaded main bundle from CM');

ipcMain.handle('open-app-light2', (_, appUrl: string) => {
    const newWindow = openWindow({}, appUrl);
    return newWindow.webContents.id;
});

export const foo = 3;
const windows: BrowserWindow[] = [];

const openWindow = (options: BrowserWindowConstructorOptions, url: string) => {
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        ...options,
    });
    window.loadURL(url);
    windows.push(window);
    return window;
};
