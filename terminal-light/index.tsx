/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

import Terminal from '../src/components/Terminal/Terminal';

import './index.css';

ipcRenderer.once('parent-id', (_, id, logs) => {
    const commandCallback = (command: string) =>
        ipcRenderer.sendTo(id, 'terminal-data', command?.trim()) as undefined;

    const onModemData = (listener: (data: string) => void) => {
        ipcRenderer.on('terminal-data', (ev, data) => listener(data));
        return () => {};
    };

    ipcRenderer.on('close-popout', () => window.close());

    ReactDOM.render(
        <Terminal
            commandCallback={commandCallback}
            onModemData={onModemData}
            savedLogs={logs}
        />,
        document.getElementById('app')
    );
});
