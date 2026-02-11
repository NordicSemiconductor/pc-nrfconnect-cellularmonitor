/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
    Group,
    selectedDevice,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import WiresharkWarning from '../wireshark/WiresharkWarning';
import { LoadTraceFile } from './LoadTraceFile';
import TraceConverter from './Tracing/TraceConverter';
import {LoadTraceFileGlobal} from "./LoadTraceFileGlobal";

export default () => {
    const device = useSelector(selectedDevice);

    if (device) return null;

    return (
        <Group heading="FILE ACTIONS">
            {/*<LoadTraceFile />*/}
            <LoadTraceFileGlobal />
            {/*<TraceConverter />*/}
            <WiresharkWarning />
        </Group>
    );
};
