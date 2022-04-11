import { BrowserWindow, ipcMain } from 'electron';

ipcMain.handle('open-popout', (event, appUrl: string) => {
    const senderWindow = BrowserWindow.getAllWindows().find(
        window => window.webContents.id === event.sender.id
    );
    if (!senderWindow) return;

    const terminalWindow = openWindow(appUrl, event.sender.id);
    terminalWindow.once('close', () => {
        try {
            event.sender.send('popout-closed', terminalWindow.webContents.id);
        } catch {
            // Main window is closed
        }
    });

    senderWindow?.once('close', () => {
        try {
            terminalWindow.close();
        } catch {
            // Terminal window is closed
        }
    });

    return terminalWindow.webContents.id;
});

const openWindow = (url: string, parent?: number) => {
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
        window.webContents.send('parent-id', parent)
    );

    return window;
};
