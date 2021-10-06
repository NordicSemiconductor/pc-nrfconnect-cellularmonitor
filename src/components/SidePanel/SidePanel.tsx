/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from 'pc-nrfconnect-shared';

import AdvancedOptions from './AdvancedOptions';
import Instructions from './Instructions';
import TraceCollector from './TraceCollector';
import TraceConverter from './TraceConverter';
import TracefileInformation from './TracefileInformation';

import './sidepanel.scss';

export default () => (
    <SidePanel className="side-panel">
        <TraceCollector />
        <Instructions />
        <TraceConverter />
        <TracefileInformation />
        <AdvancedOptions />
    </SidePanel>
);
