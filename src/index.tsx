/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App, FeedbackPane } from 'pc-nrfconnect-shared';

import appReducer from './appReducer';
import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
import EventChartDashboard from './components/EventChart/Dashboard';
import { TraceCollectorSidePanel } from './components/SidePanel/SidePanel';
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
                name: 'Dashboard',
                Main: EventChartDashboard,
                SidePanel: TraceCollectorSidePanel,
            },
            {
                name: 'Feedback',
                Main: FeedbackPane,
                SidePanel: TraceCollectorSidePanel,
            },
        ]}
        documentation={DocumentationSections}
    />
);
