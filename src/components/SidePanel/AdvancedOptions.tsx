/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, selectedDevice } from 'pc-nrfconnect-shared';

import FlashSampleModal from '../../features/flashSample/FlashSampleModal';
import DatabaseFileOverride from './DatabaseFileOverride';
import { LoadTraceFile } from './LoadTraceFile';
import { Macros } from './Macros';
import Serialports from './Serialports';
import TraceConverter from './Tracing/TraceConverter';

export default () => {
    const device = useSelector(selectedDevice);

    if (!device) return null;

    return (
        <CollapsibleGroup heading="Advanced Options" defaultCollapsed>
            <FlashSampleModal />
            <Macros />
            <LoadTraceFile />
            <TraceConverter />
            <DatabaseFileOverride />

            <Serialports />
        </CollapsibleGroup>
    );
};
