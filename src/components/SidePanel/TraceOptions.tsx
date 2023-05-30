/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CollapsibleGroup, selectedDevice, Toggle } from 'pc-nrfconnect-shared';

import { is91DK } from '../../features/programSample/programSample';
import {
    getIsTracing,
    getRefreshDashboard,
    getResetDevice,
    setRefreshDashboard,
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
            <TraceSettings />
            <TraceFormatSelector />
            <TraceFileInformation />
        </CollapsibleGroup>
    );
};

const TraceSettings = () => {
    const dispatch = useDispatch();
    const device = useSelector(selectedDevice);
    const isTracing = useSelector(getIsTracing);
    const resetDevice = useSelector(getResetDevice);
    const refreshDashboard = useSelector(getRefreshDashboard);

    const dispatchToggle = (fn: (param: boolean) => void) => (value: boolean) =>
        dispatch(fn(value));

    useEffect(() => {
        if (!is91DK(device)) {
            dispatch(setResetDevice(false));
        }
    }, [device, dispatch]);

    return (
        <>
            {is91DK(device) && (
                <Toggle
                    label="Reset device on start"
                    disabled={isTracing}
                    isToggled={resetDevice}
                    onToggle={dispatchToggle(setResetDevice)}
                />
            )}
            <Toggle
                label="Refresh dashboard on start"
                disabled={isTracing}
                isToggled={refreshDashboard}
                onToggle={dispatchToggle(setRefreshDashboard)}
            />
        </>
    );
};
