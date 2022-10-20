/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

import appReducer from './appReducer';
import Dashboard from './components/Dashboard/Dashboard';
import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
import TemporaryTab from './components/EventChart/EventsTab';
import PowerEstimation from './components/PowerEstimation/PowerEstimation';
import {
    PowerEstimationSidePanel,
    TraceCollectorSidePanel,
} from './components/SidePanel/SidePanel';
import logLibVersions from './utils/logLibVersions';

import './index.scss';

logLibVersions();

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
                name: 'Events Dashboard',
                Main: TemporaryTab,
                SidePanel: TraceCollectorSidePanel
            },
        ]}
        documentation={DocumentationSections}
    />
);
