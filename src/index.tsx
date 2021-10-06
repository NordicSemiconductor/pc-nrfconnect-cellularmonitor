/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

import Dashboard from './components/Dashboard/Dashboard';
import DeviceSelector from './components/DeviceSelector';
import SidePanel from './components/SidePanel/SidePanel';
import reducer from './reducers';
import logLibVersions from './utils/logLibVersions';

import './index.scss';

logLibVersions();

export default () => (
    <App
        reportUsageData
        appReducer={reducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<SidePanel />}
        panes={[{ name: 'Trace Collector', Main: Dashboard }]}
    />
);
