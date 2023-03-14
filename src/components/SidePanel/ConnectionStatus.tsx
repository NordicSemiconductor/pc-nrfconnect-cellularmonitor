/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Steppers } from 'pc-nrfconnect-shared';
import { Step } from 'pc-nrfconnect-shared/src/Steppers/Steppers';

import {
    getTraceProgress,
    getTraceTaskId,
} from '../../features/tracing/traceSlice';

const TRACE_DEFAULT_STATE: Step = {
    title: 'TRACE',
};

const TRACE_LOADING_STATE: Step = {
    title: 'TRACE',
    active: true,
};

const TRACE_SUCCESS_STATE: Step = {
    title: 'TRACE',
    success: true,
    caption: 'Trace is enabled',
};

const TRACE_FAIL_STATE: Step = {
    title: 'TRACE',
    fail: true,
    caption: 'Failed to get trace',
};

export default () => {
    const [isTraceFailed, setIsTraceFailed] = useState(false);
    const progress = useSelector(getTraceProgress);
    const traceTaskId = useSelector(getTraceTaskId);
    const isTraceFileEmpty = !progress.find(p => p.size && p.size > 0);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (traceTaskId && isTraceFileEmpty) {
            timer = setTimeout(() => {
                setIsTraceFailed(true);
            }, 10000);
        }
        return () => {
            setIsTraceFailed(false);
            clearTimeout(timer);
        };
    }, [traceTaskId, isTraceFileEmpty]);

    let traceState = TRACE_DEFAULT_STATE;
    if (traceTaskId && !isTraceFailed) traceState = TRACE_LOADING_STATE;
    if (traceTaskId && !isTraceFileEmpty && !isTraceFailed)
        traceState = TRACE_SUCCESS_STATE;
    if (isTraceFailed) traceState = TRACE_FAIL_STATE;

    const steps: Step[] = [
        traceState,
        { title: 'MODEM', caption: 'caption', active: true },
        { title: 'SIM', caption: 'caption', success: true },
        { title: 'LTE', caption: 'caption', fail: true },
        { title: 'PDN', caption: 'caption' },
    ];
    return (
        <div className="connection-status-container">
            <Steppers steps={steps} />
        </div>
    );
};
