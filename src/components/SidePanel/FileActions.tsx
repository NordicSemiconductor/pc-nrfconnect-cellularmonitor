/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Group, selectedDevice } from 'pc-nrfconnect-shared';

import { LoadTraceFile } from './LoadTraceFile';
import TraceConverter from './Tracing/TraceConverter';
import { AddTsharkSink } from './TsharkSink';

export default () => {
    const device = useSelector(selectedDevice);

    if (device) return null;

    return (
        <Group heading="FILE ACTIONS">
            <AddTsharkSink />
            <LoadTraceFile />
            <TraceConverter />
        </Group>
    );
};
