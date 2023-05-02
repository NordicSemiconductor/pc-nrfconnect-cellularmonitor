/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from 'pc-nrfconnect-shared';

import StartupDialog from '../../features/startup/startupDialog';
import { OpenSerialTerminal } from '../../features/terminal';
import AdvancedOptions from './AdvancedOptions';
import ConnectionStatus from './ConnectionStatus';
import FileActions from './FileActions';
import Instructions from './Instructions';
import { Recommended } from './Macros';
import TraceOptions from './TraceOptions';
import TraceCollector from './Tracing/TraceCollector';

import './sidepanel.scss';
import './Tracing/tracing.scss';

export const TraceCollectorSidePanel = () => (
    <SidePanel className="side-panel">
        <StartupDialog />
        <Instructions />
        <FileActions />

        <TraceCollector />
        <Recommended />
        <OpenSerialTerminal />

        <ConnectionStatus />
        <TraceOptions />
        <AdvancedOptions />
    </SidePanel>
);
