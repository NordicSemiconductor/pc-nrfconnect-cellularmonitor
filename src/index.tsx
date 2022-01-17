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
import PowerEstimation from './components/PowerEstimation/PowerEstimation';
import SidePanel from './components/SidePanel/SidePanel';
import logLibVersions from './utils/logLibVersions';

import './index.scss';

logLibVersions();

export default () => (
    <App
        reportUsageData
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<SidePanel />}
        panes={[
            { name: 'Trace Collector', Main: Dashboard },
            { name: 'Power Estimation', Main: PowerEstimation },
        ]}
        documentation={DocumentationSections}
    />
);
