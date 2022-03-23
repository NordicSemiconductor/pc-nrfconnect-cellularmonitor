/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ipcRenderer } from 'electron';
import { Button, logger, SidePanel } from 'pc-nrfconnect-shared';

import { TERMINAL_OUTPUT } from '../../../terminal-light/sample-output';
import AdvancedOptions from './AdvancedOptions';
import Instructions from './Instructions';
import PowerEstimationParams from './PowerEstimationParams';
import TraceCollector from './Tracing/TraceCollector';
import TraceFileInformation from './Tracing/TraceFileInformation';

import './sidepanel.scss';
import './Tracing/tracing.scss';

export const PowerEstimationSidePanel = () => (
    <SidePanel>
        <PowerEstimationParams />
    </SidePanel>
);

export const TraceCollectorSidePanel = () => (
    <SidePanel className="side-panel">
        <Instructions />
        <TraceCollector />
        <TraceFileInformation />
        <AdvancedOptions />
        <Button onClick={openTerminal}>Terminal</Button>
        <Button onClick={openTerminalLight}>Terminal light</Button>
        <Button onClick={sendTerminalData}>Send data to terminal</Button>
    </SidePanel>
);

const openTerminal = () => {
    ipcRenderer.send('open-app', {
        name: 'pc-nrfconnect-cellularmonitor-terminal',
        currentVersion: '1.0.0',
        path: 'C:\\Users\\jonas\\.nrfconnect-apps\\local\\pc-nrfconnect-cellularmonitor\\terminal',
    });
};

let terminalWindowId: number;

const openTerminalLight = async () => {
    const url =
        'file://C:\\Users\\jonas\\.nrfconnect-apps\\local\\pc-nrfconnect-cellularmonitor\\terminal-light/index.html';
    terminalWindowId = await ipcRenderer.invoke('open-app-light', url);
};

const sendTerminalData = () => {
    let delay = 0;
    TERMINAL_OUTPUT.forEach(line => {
        delay += Math.floor(Math.random() * 200 + 50);
        setTimeout(() => {
            ipcRenderer.sendTo(terminalWindowId, 'terminal-data', line);
        }, delay);
    });
};
