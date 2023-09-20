/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CollapsibleGroup,
    selectedDevice,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { is9160DK } from '../../features/programSample/programSample';
import {
    getIsTracing,
    getRefreshOnStart,
    getResetDevice,
    getTraceFormats,
    setRefreshOnStart,
    setResetDevice,
} from '../../features/tracing/traceSlice';
import DatabaseFileOverride from './DatabaseFileOverride';
import Serialports from './Serialports';
import TraceFileInformation from './Tracing/TraceFileInformation';
import TraceFormatSelector from './Tracing/TraceFormatSelector';

export default () => {
    const device = useSelector(selectedDevice);
    if (!device) return null;

    return (
        <CollapsibleGroup defaultCollapsed={false} heading="TRACE OPTIONS">
            <DatabaseFileOverride />
            <Serialports />
            {is9160DK(device) && <ResetOnStart />}
            <RefreshOnStart />
            <TraceFormatSelector />
            <TraceFileInformation />
        </CollapsibleGroup>
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
    const title = liveEnabled
        ? 'Cannot be enabled when Wireshark is enabled.'
        : 'Refresh dashboard 5 seconds after starting the trace';

    return (
        <Toggle
            label="Refresh dashboard on start"
            disabled={isTracing || liveEnabled}
            isToggled={refreshOnStart}
            onToggle={toggled => dispatch(setRefreshOnStart(toggled))}
            title={title}
        />
    );
};
