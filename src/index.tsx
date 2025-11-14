/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    App,
    render,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import appReducer from './app/appReducer';
import DeviceSelector from './app/DeviceSelector';
import DocumentationSections from './app/DocumentationSection';
import logLibVersions from './app/logLibVersions';
import { enableNrfmlLogging } from './app/monitorLibLogging';
import CertificateManager from './features/certificateManager/CertificateManager';
import EventChartDashboard from './features/dashboard/Dashboard';
import { TraceCollectorSidePanel } from './features/SidePanel/SidePanel';

import './index.scss';

telemetry.enableTelemetry();
logLibVersions();
enableNrfmlLogging();

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
        documentation={DocumentationSections}
    />,
);
