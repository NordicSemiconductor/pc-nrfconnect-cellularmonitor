import { app, BrowserWindow, ipcMain } from 'electron';

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

    const closeTerminal = () => {
        if (!terminalWindow) return;
        try {
            terminalWindow.removeAllListeners();
            terminalWindow.close();
        } catch {
            // Terminal window is closed
        }
    };

    const onReload = (focusedWindowId: number) => {
        if (focusedWindowId === senderWindow.webContents.id) closeTerminal();
    };

    app.on('reload', onReload);

    senderWindow?.once('close', () => {
        app.removeListener('reload', onReload);
        closeTerminal();
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
