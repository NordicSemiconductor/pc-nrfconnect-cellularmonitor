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
    getTraceDataReceived,
    getTraceProgress,
    getTraceTaskId,
} from '../../features/tracing/traceSlice';
import { getDashboardState } from '../../features/tracingEvents/dashboardSlice';

// Trace state
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

// Modem state
const MODEM_DEFAULT_STATE: Step = {
    title: 'MODEM',
};
const MODEM_LOADING_STATE: Step = {
    title: 'MODEM',
    active: true,
};
const MODEM_SUCCESS_STATE: Step = {
    title: 'MODEM',
    success: true,
    caption: 'Modem is enabled',
};
const MODEM_FAIL_STATE: Step = {
    title: 'MODEM',
    fail: true,
    caption: 'Modem is not enabled',
};

// SIM state
const SIM_DEFAULT_STATE: Step = {
    title: 'SIM',
};
const SIM_LOADING_STATE: Step = {
    title: 'SIM',
    active: true,
};
const SIM_SUCCESS_STATE: Step = {
    title: 'SIM',
    success: true,
    caption: 'SIM is enabled',
};
const SIM_FAIL_STATE: Step = {
    title: 'SIM',
    fail: true,
    caption: 'SIM is not enabled',
};

export default () => {
    // Handle trace state
    const [traceFailed, setTraceFailed] = useState(false);
    const traceTaskId = useSelector(getTraceTaskId);
    const traceDataReceived = useSelector(getTraceDataReceived);
    const traceEnabled = traceTaskId && traceDataReceived && !traceFailed;

    let traceState = TRACE_DEFAULT_STATE;
    if (traceTaskId && !traceFailed) traceState = TRACE_LOADING_STATE;
    if (traceEnabled) traceState = TRACE_SUCCESS_STATE;
    if (traceFailed) traceState = TRACE_FAIL_STATE;
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (traceTaskId && !traceDataReceived) {
            timer = setTimeout(() => {
                setTraceFailed(true);
            }, 10000);
        }
        return () => {
            setTraceFailed(false);
            clearTimeout(timer);
        };
    }, [traceTaskId, traceDataReceived]);

    // Handle modem state
    const functionalMode = useSelector(getDashboardState).functionalMode;
    const [modemFailed, setModemFailed] = useState(false);
    const modemEnabled = functionalMode === 1; // value 1 indicates modem enabled;
    let modemState = MODEM_DEFAULT_STATE;
    if (traceEnabled && !modemFailed) modemState = MODEM_LOADING_STATE;
    if (traceEnabled && modemEnabled) modemState = MODEM_SUCCESS_STATE;
    if (modemFailed) modemState = MODEM_FAIL_STATE;
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (traceEnabled && !modemEnabled) {
            timer = setTimeout(() => {
                setModemFailed(true);
            }, 10000);
        }
        return () => {
            setModemFailed(false);
            clearTimeout(timer);
        };
    }, [traceEnabled, modemEnabled]);

    // Handle SIM state
    const [simFailed, setSimFailed] = useState(false);
    const simEnabled = functionalMode === 1 || functionalMode === 41; // value 1 or 41 indicates SIM enabled;
    let simState = SIM_DEFAULT_STATE;
    if (modemEnabled && !simFailed) simState = SIM_LOADING_STATE;
    if (modemEnabled && simEnabled) simState = SIM_SUCCESS_STATE;
    if (simFailed) simState = SIM_FAIL_STATE;
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (modemEnabled && !simEnabled) {
            timer = setTimeout(() => {
                setSimFailed(true);
            }, 10000);
        }
        return () => {
            setSimFailed(false);
            clearTimeout(timer);
        };
    }, [modemEnabled, simEnabled]);

    const steps: Step[] = [
        traceState,
        modemState,
        simState,
        { title: 'LTE', caption: 'caption', fail: true },
        { title: 'PDN', caption: 'caption' },
    ];
    return (
        <div className="connection-status-container">
            <Steppers steps={steps} />
        </div>
    );
};
