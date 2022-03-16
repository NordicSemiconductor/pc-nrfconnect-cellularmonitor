/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ipcRenderer } from 'electron';
import { Button, logger, SidePanel } from 'pc-nrfconnect-shared';

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

const sendTerminalData = () => {
    logger.info('Sending some terminal data broadcast-terminal-data');
    ipcRenderer.send('broadcast-terminal-data', 'Some data');
};
