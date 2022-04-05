/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ipcRenderer } from 'electron';
import { App, getAppDir, logger } from 'pc-nrfconnect-shared';

import appReducer from './appReducer';
import Dashboard from './components/Dashboard/Dashboard';
import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
import PowerEstimation from './components/PowerEstimation/PowerEstimation';
import {
    PowerEstimationSidePanel,
    TraceCollectorSidePanel,
} from './components/SidePanel/SidePanel';
import Terminal from './components/Terminal/Main';
import TerminalSidePanel from './components/Terminal/SidePanel';
import logLibVersions from './utils/logLibVersions';

import './index.scss';

logLibVersions();

ipcRenderer
    .invoke('require', `${getAppDir()}/dist/main-bundle`)
    .then(succeeded => {
        if (succeeded) logger.info('Successfully loaded main bundle');
    });

export default () => (
    <App
        reportUsageData
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<div />}
        panes={[
            {
                name: 'Trace Collector',
                Main: Dashboard,
                SidePanel: TraceCollectorSidePanel,
            },
            {
                name: 'Power Estimation',
                Main: PowerEstimation,
                SidePanel: PowerEstimationSidePanel,
            },
            {
                name: 'Terminal',
                Main: Terminal,
                SidePanel: TerminalSidePanel,
            },
        ]}
        documentation={DocumentationSections}
    />
);
