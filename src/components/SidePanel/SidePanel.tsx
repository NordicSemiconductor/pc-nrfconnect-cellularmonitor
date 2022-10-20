/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from 'pc-nrfconnect-shared';

import AdvancedOptions from './AdvancedOptions';
import Instructions from './Instructions';
import PowerEstimationParams from './PowerEstimationParams';
import TraceCollector from './Tracing/TraceCollector';
import TraceFileInformation from './Tracing/TraceFileInformation';

import './sidepanel.scss';
import './Tracing/tracing.scss';
import { LoadTraceFile } from './LoadTraceFile';

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
        <LoadTraceFile />
    </SidePanel>
);
