/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    CollapsibleGroup,
    selectedDevice,
    Step,
    Stepper,
} from 'pc-nrfconnect-shared';

import {
    getIsTracing,
    getTraceDataReceived,
    getTraceSourceFilePath,
    getTraceTaskId,
} from '../../features/tracing/traceSlice';
import { getDashboardState } from '../../features/tracingEvents/dashboardSlice';
import {
    getCollapseConnectionStatusSection,
    setCollapseConnectionStatusSection,
} from '../../utils/store';

// Trace state
const TRACE_DEFAULT_STATE: Step = {
    id: 'TRACE_DEFAULT',
    title: 'TRACE',
};
const TRACE_LOADING_STATE: Step = {
    id: 'TRACE_LOADING',
    title: 'TRACE',
    state: 'active',
};
const TRACE_SUCCESS_STATE: Step = {
    id: 'TRACE_SUCCESS',
    title: 'TRACE',
    state: 'success',
};
const TRACE_FAIL_STATE: Step = {
    id: 'TRACE_FAIL',
    title: 'TRACE',
    state: 'failure',
};

// SIM state
const SIM_DEFAULT_STATE: Step = {
    id: 'SIM_DEFAULT',
    title: 'SIM',
};
const SIM_SUCCESS_STATE: Step = {
    id: 'SIM_SUCCESS',
    title: 'SIM',
    state: 'success',
};
const SIM_FAIL_STATE: Step = {
    id: 'SIM_FAIL',
    title: 'SIM',
    state: 'failure',
    caption: 'Not initialized',
};

// LTE state
const LTE_DEFAULT_STATE: Step = {
    id: 'LTE_DEFAULT',
    title: 'LTE',
};
const LTE_LOADING_STATE: Step = {
    id: 'LTE_LOADING',
    title: 'LTE',
    state: 'active',
};
const LTE_SUCCESS_STATE: Step = {
    id: 'LTE_SUCCESS',
    title: 'LTE',
    state: 'success',
};
const LTE_FAIL_STATE: Step = {
    id: 'LTE_FAIL',
    title: 'LTE',
    state: 'failure',
};

// PDN state
const PDN_DEFAULT_STATE: Step = {
    id: 'PDN_DEFAULT',
    title: 'PDN',
};
const PDN_SUCCESS_STATE: Step = {
    id: 'PDN_SUCCESS',
    title: 'PDN',
    state: 'success',
};

const STATUS_CHECK_TIMEOUT = 60 * 1000; // 1 minute

export default () => {
    const device = useSelector(selectedDevice);
    const {
        networkStatus,
        accessPointNames,
        uiccInitialised,
        uiccInitialisedErrorCause,
    } = useSelector(getDashboardState);
    const sourceFilePath = useSelector(getTraceSourceFilePath);
    const isTracing = useSelector(getIsTracing);

    useEffect(() => {
        if (isTracing) {
            // Since this is fired in on out of two scenarios
            // from False --> True
            // or from True --> False, we know that tracing just started.

            // Should at least get some raw data in trace quite early.
            setTimeout(() => {
                setTraceFailed(true);
            }, STATUS_CHECK_TIMEOUT);
        }
    }, [isTracing]);

    // Handle trace state
    const [traceFailed, setTraceFailed] = useState(false);
    const traceTaskId = useSelector(getTraceTaskId);
    const traceSourceFilePath = useSelector(getTraceSourceFilePath);
    const traceDataReceived = useSelector(getTraceDataReceived);
    const traceEnabled =
        (traceTaskId || traceSourceFilePath) &&
        traceDataReceived &&
        !traceFailed;

    let traceState = TRACE_DEFAULT_STATE;
    if (traceEnabled) {
        traceState = TRACE_SUCCESS_STATE;
    } else if (traceFailed) {
        traceState = TRACE_FAIL_STATE;
    } else if (isTracing) {
        traceState = TRACE_LOADING_STATE;
    }

    // Handle SIM state
    let simState = SIM_DEFAULT_STATE;
    if (uiccInitialised) {
        simState = SIM_SUCCESS_STATE;
    } else if (uiccInitialised === false) {
        if (uiccInitialisedErrorCause) {
            simState = {
                ...SIM_FAIL_STATE,
                caption: uiccInitialisedErrorCause,
            };
        } else {
            simState = SIM_FAIL_STATE;
        }
    }

    // Handle LTE Connection State
    let lteConnectionState = LTE_DEFAULT_STATE;
    if (networkStatus === 1 || networkStatus === 5) {
        lteConnectionState = LTE_SUCCESS_STATE;
    } else if (networkStatus === 0) {
        lteConnectionState = {
            ...LTE_LOADING_STATE,
            caption:
                'Not registered. UE is not currently searching for an operator to register to.',
        };
    } else if (networkStatus === 2) {
        lteConnectionState = {
            ...LTE_LOADING_STATE,
            caption:
                'Not registered, but UE is currently trying to attach or searching an operator to register to.',
        };
    } else if (networkStatus === 3) {
        lteConnectionState = {
            ...LTE_FAIL_STATE,
            caption: 'Registration failed.',
        };
    } else if (networkStatus === 4) {
        lteConnectionState = {
            ...LTE_FAIL_STATE,
            caption: 'Unknown (for example, out of E-UTRAN coverage).',
        };
    } else if (networkStatus === 90) {
        lteConnectionState = {
            ...LTE_FAIL_STATE,
            caption: 'Not registered due to UICC failure.',
        };
    }

    // Handle PDN state
    let pdnState = PDN_DEFAULT_STATE;
    if (Object.values(accessPointNames).length > 0) {
        pdnState = PDN_SUCCESS_STATE;
    }

    if (!device && !sourceFilePath) {
        return null;
    }

    return (
        <CollapsibleGroup
            heading="Connection Status"
            defaultCollapsed={getCollapseConnectionStatusSection()}
            onToggled={isNowExpanded =>
                setCollapseConnectionStatusSection(!isNowExpanded)
            }
        >
            <div className="my-2">
                <Stepper
                    steps={[traceState, simState, lteConnectionState, pdnState]}
                />
            </div>
        </CollapsibleGroup>
    );
};
