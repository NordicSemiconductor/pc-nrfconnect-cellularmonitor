import { BrowserWindow, ipcMain } from 'electron';

ipcMain.handle('open-terminal-app', (event, appUrl: string) => {
    const senderWindow = BrowserWindow.getAllWindows().find(
        window => window.webContents.id === event.sender.id
    );
    const terminalWindow = openWindow(appUrl, senderWindow);
    senderWindow?.once('close', () => terminalWindow.close());

    return terminalWindow.webContents.id;
});

const openWindow = (url: string, parent?: BrowserWindow) => {
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        backgroundColor: '#263238',
        autoHideMenuBar: true,
        title: 'Terminal',
    });
    window.loadFile(url);

    window.on('ready-to-show', () =>
        window.webContents.send('parent-id', parent?.webContents.id)
    );

    return window;
};
