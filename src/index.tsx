/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App, render } from '@nordicsemiconductor/pc-nrfconnect-shared';
import usageData from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/usageData';

import appReducer from './appReducer';
import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
import { TraceCollectorSidePanel } from './components/SidePanel/SidePanel';
import CertificateManager from './features/certificateManager/CertificateManager';
import EventChartDashboard from './features/dashboard/Dashboard';
import logLibVersions from './utils/logLibVersions';

import './index.scss';

usageData.enableTelemetry();
logLibVersions();

render(
    <App
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
                name: 'Certificate Manager',
                Main: CertificateManager,
            },
        ]}
        feedback
        documentation={DocumentationSections}
    />
);
