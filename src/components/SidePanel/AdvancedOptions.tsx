/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { CollapsibleGroup } from 'pc-nrfconnect-shared';

import FlashSampleModal from '../../features/flashSample/FlashSampleModal';
import DatabaseFileOverride from './DatabaseFileOverride';
import { LoadTraceFile } from './LoadTraceFile';
import { Macros } from './Macros';
import Serialports from './Serialports';
import TraceConverter from './Tracing/TraceConverter';

export default () => (
    <CollapsibleGroup heading="Advanced Options" defaultCollapsed>
        <FlashSampleModal />
        <Macros />
        <LoadTraceFile />
        <TraceConverter />
        <DatabaseFileOverride />

        <Serialports />
    </CollapsibleGroup>
);
