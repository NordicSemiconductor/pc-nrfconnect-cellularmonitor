/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Group,
    selectedDevice,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { is9160DK } from '../programSample/programSample';
import {
    getIsTracing,
    getRefreshOnStart,
    getResetDevice,
    getTraceFormats,
    setRefreshOnStart,
    setResetDevice,
} from '../tracing/traceSlice';
import DatabaseFileOverride from './DatabaseFileOverride';
import Serialports from './Serialports';
import TraceFileInformation from './Tracing/TraceFileInformation';
import TraceFormatSelector from './Tracing/TraceFormatSelector';

export default () => {
    const device = useSelector(selectedDevice);
    if (!device) return null;

    return (
        <Group defaultCollapsed={false} collapsible heading="TRACE OPTIONS">
            <DatabaseFileOverride />
            <Serialports />
            {is9160DK(device) && <ResetOnStart />}
            <RefreshOnStart />
            <TraceFormatSelector />
            <TraceFileInformation />
        </Group>
    );
};

const ResetOnStart = () => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const resetDevice = useSelector(getResetDevice);

    return (
        <Toggle
            label="Reset device on start"
            disabled={isTracing}
            isToggled={resetDevice}
            onToggle={toggled => dispatch(setResetDevice(toggled))}
        />
    );
};

const RefreshOnStart = () => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const refreshOnStart = useSelector(getRefreshOnStart);
    const selectedFormats = useSelector(getTraceFormats);
    const liveEnabled = selectedFormats.includes('live');
    const title =
        'Cannot be enabled when Wireshark is enabled.\nRefresh dashboard 5 seconds after starting the trace';

    return (
        <Toggle
            label="Refresh dashboard on start"
            disabled={isTracing || liveEnabled}
            isToggled={refreshOnStart && !liveEnabled}
            onToggle={toggled => dispatch(setRefreshOnStart(toggled))}
            title={title}
        />
    );
};
