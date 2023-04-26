/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from 'pc-nrfconnect-shared';

import { OpenSerialTerminal } from '../../features/terminal';
import AdvancedOptions from './AdvancedOptions';
import ConnectionStatus from './ConnectionStatus';
import FileActions from './FileActions';
import Instructions from './Instructions';
import { Macros } from './Macros';
import TraceOptions from './TraceOptions';
import TraceCollector from './Tracing/TraceCollector';
import TraceFileInformation from './Tracing/TraceFileInformation';

import './sidepanel.scss';
import './Tracing/tracing.scss';

export const TraceCollectorSidePanel = () => (
    <SidePanel className="side-panel">
        <Instructions />
        <FileActions />

        <TraceCollector />
        <Macros />

        <OpenSerialTerminal />

        <ConnectionStatus />
        <TraceOptions />
        <AdvancedOptions />

        <TraceFileInformation />
    </SidePanel>
);
