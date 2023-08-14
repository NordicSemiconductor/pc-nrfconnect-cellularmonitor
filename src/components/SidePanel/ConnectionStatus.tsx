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
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getIsTracing,
    getTraceDataReceived,
    getTraceSourceFilePath,
} from '../../features/tracing/traceSlice';
import { getDashboardState } from '../../features/tracingEvents/dashboardSlice';
import { ConnectionEvaluationResult } from '../../features/tracingEvents/types';
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
    title: 'LTE CONNECTION',
};
const LTE_LOADING_STATE: Step = {
    id: 'LTE_LOADING',
    title: 'LTE CONNECTION',
    state: 'active',
};
const LTE_SUCCESS_STATE: Step = {
    id: 'LTE_SUCCESS',
    title: 'LTE CONNECTION',
    state: 'success',
};
const LTE_FAIL_STATE: Step = {
    id: 'LTE_FAIL',
    title: 'LTE CONNECTION',
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
        uiccInitialised,
        uiccInitialisedErrorCause,

        networkStatusLastUpdate,
        packetDomainStatus,
        networkStatus,
        conevalResult,

        accessPointNames,
    } = useSelector(getDashboardState);
    const sourceFilePath = useSelector(getTraceSourceFilePath);
    const isTracing = useSelector(getIsTracing);
    const traceDataReceived = useSelector(getTraceDataReceived);
    const [traceTimedOut, setTraceTimedOut] = useState(false);

    // Handle PDN state
    let pdnState = PDN_DEFAULT_STATE;
    if (Object.values(accessPointNames).length > 0) {
        pdnState = PDN_SUCCESS_STATE;
    }

    // Handle LTE Connection State
    let lteConnectionState = LTE_DEFAULT_STATE;
    if (pdnState === PDN_SUCCESS_STATE) {
        lteConnectionState = LTE_SUCCESS_STATE;
    } else if (networkStatusLastUpdate === 'coneval') {
        lteConnectionState = validateConeval(conevalResult, lteConnectionState);
    } else if (networkStatusLastUpdate === 'networkStatus' && networkStatus) {
        lteConnectionState = validateNetworkStatus(
            networkStatus,
            lteConnectionState
        );
    } else if (
        networkStatusLastUpdate === 'packetDomainEvent' &&
        packetDomainStatus
    ) {
        lteConnectionState = {
            ...LTE_FAIL_STATE,
            caption: packetDomainStatus,
        };
    }

    // Handle SIM state
    let simState = SIM_DEFAULT_STATE;
    if (lteConnectionState === LTE_SUCCESS_STATE || uiccInitialised) {
        simState = SIM_SUCCESS_STATE;
    } else if (
        uiccInitialised === false ||
        (typeof lteConnectionState.caption === 'string' &&
            lteConnectionState.caption.includes('UICC'))
    ) {
        if (uiccInitialisedErrorCause) {
            simState = {
                ...SIM_FAIL_STATE,
                caption: uiccInitialisedErrorCause,
            };
        } else {
            simState = SIM_FAIL_STATE;
        }
    }

    useEffect(() => {
        if (isTracing && !traceDataReceived) {
            const timeout = setTimeout(
                () => setTraceTimedOut(true),
                STATUS_CHECK_TIMEOUT
            );
            return () => clearTimeout(timeout);
        }
    }, [isTracing, traceDataReceived]);

    // Handle trace state

    let traceState = TRACE_DEFAULT_STATE;
    if (traceDataReceived) {
        traceState = TRACE_SUCCESS_STATE;
    } else if (traceTimedOut) {
        traceState = TRACE_FAIL_STATE;
    } else if (isTracing) {
        traceState = TRACE_LOADING_STATE;
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

const validateConeval = (
    conevalResult: ConnectionEvaluationResult,
    lteConnectionState: Step
) => {
    switch (conevalResult) {
        case 0:
            return LTE_SUCCESS_STATE;
        case 1:
            return {
                ...LTE_FAIL_STATE,
                caption: 'Evaluation failed, no cell available',
            };
        case 2:
            return {
                ...LTE_FAIL_STATE,
                caption: 'Evaluation failed, UICC not available',
            };
        case 3:
            return {
                ...LTE_FAIL_STATE,
                caption: 'Evaluation failed, only barred cells available',
            };
        case 4:
            return {
                ...LTE_FAIL_STATE,
                caption: 'Evaluation failed, busy (for example, GNSS activity)',
            };
        case 5:
            return {
                ...LTE_FAIL_STATE,
                caption:
                    'Evaluation failed, aborted because of higher priority operation',
            };
        case 6:
            return {
                ...LTE_FAIL_STATE,
                caption: 'Evaluation failed, not registered',
            };
        case 7:
            return {
                ...LTE_FAIL_STATE,
                caption: 'Evaluation failed, unspecified',
            };
        default: {
            return lteConnectionState;
        }
    }
};

const validateNetworkStatus = (
    networkStatus: number,
    lteConnectionState: Step
) => {
    if (networkStatus === 0) {
        return {
            ...LTE_LOADING_STATE,
            caption:
                'Not registered. UE is not currently searching for an operator to register to.',
        };
    }
    if (networkStatus === 2) {
        return {
            ...LTE_LOADING_STATE,
            caption:
                'Not registered, but UE is currently trying to attach or searching an operator to register to.',
        };
    }
    if (networkStatus === 3) {
        return {
            ...LTE_FAIL_STATE,
            caption: 'Registration failed.',
        };
    }
    if (networkStatus === 4) {
        return {
            ...LTE_FAIL_STATE,
            caption: 'Unknown (for example, out of E-UTRAN coverage).',
        };
    }
    if (networkStatus === 90) {
        return {
            ...LTE_FAIL_STATE,
            caption: 'Not registered due to UICC failure.',
        };
    }
    if (networkStatus === 1 || networkStatus === 5) {
        return LTE_SUCCESS_STATE;
    }

    return lteConnectionState;
};
