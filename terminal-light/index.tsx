import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

import Terminal from './Terminal';

ipcRenderer.once('parent-id', (_, id) => {
    const commandCallback = (command: string) => {
        ipcRenderer.sendTo(id, 'terminal-data', command?.trim());
    };

    const onModemData = (listener: (data: string) => void) => {
        ipcRenderer.on('terminal-data', (ev, data) => listener(data));
    };

    ReactDOM.render(
        <Terminal
            commandCallback={commandCallback}
            onModemData={onModemData}
        />,
        document.getElementById('app')
    );
});
