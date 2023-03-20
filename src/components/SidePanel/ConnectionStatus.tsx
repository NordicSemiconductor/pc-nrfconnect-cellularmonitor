/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, Steppers } from 'pc-nrfconnect-shared';
import { Step } from 'pc-nrfconnect-shared/src/Steppers/Steppers';

import {
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
    title: 'TRACE',
};
const TRACE_LOADING_STATE: Step = {
    title: 'TRACE',
    state: 'active',
};
const TRACE_SUCCESS_STATE: Step = {
    title: 'TRACE',
    state: 'success',
    caption: 'Trace is enabled',
};
const TRACE_FAIL_STATE: Step = {
    title: 'TRACE',
    state: 'failure',
    caption: 'Failed to get trace',
};

// Modem state
const MODEM_DEFAULT_STATE: Step = {
    title: 'MODEM',
};
const MODEM_LOADING_STATE: Step = {
    title: 'MODEM',
    state: 'active',
};
const MODEM_SUCCESS_STATE: Step = {
    title: 'MODEM',
    state: 'success',
    caption: 'Modem is enabled',
};
const MODEM_FAIL_STATE: Step = {
    title: 'MODEM',
    state: 'failure',
    caption: 'Modem is not enabled',
};

// SIM state
const SIM_DEFAULT_STATE: Step = {
    title: 'SIM',
};
const SIM_LOADING_STATE: Step = {
    title: 'SIM',
    state: 'active',
};
const SIM_SUCCESS_STATE: Step = {
    title: 'SIM',
    state: 'success',
    caption: 'SIM is enabled',
};
const SIM_FAIL_STATE: Step = {
    title: 'SIM',
    state: 'failure',
    caption: 'SIM is not enabled',
};

// LTE state
const LTE_DEFAULT_STATE: Step = {
    title: 'LTE',
};
const LTE_LOADING_STATE: Step = {
    title: 'LTE',
    state: 'active',
};
const LTE_SUCCESS_STATE: Step = {
    title: 'LTE',
    state: 'success',
    caption: 'LTE is enabled',
};
const LTE_FAIL_STATE: Step = {
    title: 'LTE',
    state: 'failure',
    caption: 'LTE is not enabled',
};

// PDN state
const PDN_DEFAULT_STATE: Step = {
    title: 'PDN',
};
const PDN_LOADING_STATE: Step = {
    title: 'PDN',
    state: 'active',
};
const PDN_SUCCESS_STATE: Step = {
    title: 'PDN',
    state: 'success',
    caption: 'PDN is enabled',
};
const PDN_FAIL_STATE: Step = {
    title: 'PDN',
    state: 'failure',
    caption: 'PDN is not enabled',
};

const STATUS_CHECK_TIMEOUT = 60 * 1000; // 1 minute

export default () => {
    const { functionalMode, AcTState, accessPointNames } =
        useSelector(getDashboardState);

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
    if ((traceTaskId || traceSourceFilePath) && !traceFailed)
        traceState = TRACE_LOADING_STATE;
    if (traceEnabled) traceState = TRACE_SUCCESS_STATE;
    if (traceFailed) traceState = TRACE_FAIL_STATE;
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if ((traceTaskId || traceSourceFilePath) && !traceDataReceived) {
            timer = setTimeout(() => {
                setTraceFailed(true);
            }, STATUS_CHECK_TIMEOUT);
        }
        if (!(traceTaskId || traceSourceFilePath)) {
            setTraceFailed(false);
            setModemFailed(false);
            setSimFailed(false);
            setLteFailed(false);
            setPdnFailed(false);
        }
        return () => {
            setTraceFailed(false);
            clearTimeout(timer);
        };
    }, [traceTaskId, traceSourceFilePath, traceDataReceived]);

    // Handle modem state
    const [modemFailed, setModemFailed] = useState(false);
    const modemEnabled = traceEnabled && functionalMode === 1; // value 1 indicates modem enabled;
    let modemState = MODEM_DEFAULT_STATE;
    if (traceEnabled && !modemFailed) modemState = MODEM_LOADING_STATE;
    if (traceEnabled && modemEnabled) modemState = MODEM_SUCCESS_STATE;
    if (modemFailed) modemState = MODEM_FAIL_STATE;
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (traceEnabled && !modemEnabled) {
            timer = setTimeout(() => {
                setModemFailed(true);
            }, STATUS_CHECK_TIMEOUT);
        }
        return () => {
            setModemFailed(false);
            clearTimeout(timer);
        };
    }, [traceEnabled, modemEnabled]);

    // Handle SIM state
    const [simFailed, setSimFailed] = useState(false);
    const simEnabled =
        modemEnabled && (functionalMode === 1 || functionalMode === 41); // value 1 or 41 indicates SIM enabled;
    let simState = SIM_DEFAULT_STATE;
    if (modemEnabled && !simFailed) simState = SIM_LOADING_STATE;
    if (modemEnabled && simEnabled) simState = SIM_SUCCESS_STATE;
    if (simFailed) simState = SIM_FAIL_STATE;
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (modemEnabled && !simEnabled) {
            timer = setTimeout(() => {
                setSimFailed(true);
            }, STATUS_CHECK_TIMEOUT);
        }
        return () => {
            setSimFailed(false);
            clearTimeout(timer);
        };
    }, [modemEnabled, simEnabled]);

    // Handle LTE state
    const [lteFailed, setLteFailed] = useState(false);
    const lteEnabled =
        simEnabled &&
        (AcTState === 4 || // value 4  indicates LTE-M
            AcTState === 7 || // value  7 indicates LTE-M
            AcTState === 5 || // value 5 indicates NB-IoT
            AcTState === 9); // value 9 indicates NB-IoT
    let lteState = LTE_DEFAULT_STATE;
    if (simEnabled && !lteEnabled) lteState = LTE_LOADING_STATE;
    if (simEnabled && lteEnabled) lteState = LTE_SUCCESS_STATE;
    if (lteFailed) lteState = LTE_FAIL_STATE;
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (simEnabled && !lteEnabled) {
            timer = setTimeout(() => {
                setLteFailed(true);
            }, STATUS_CHECK_TIMEOUT);
        }
        return () => {
            setLteFailed(false);
            clearTimeout(timer);
        };
    }, [simEnabled, lteEnabled]);

    // Handle PDN state
    const [pdnFailed, setPdnFailed] = useState(false);
    const pdnEnabled =
        lteEnabled && accessPointNames && accessPointNames.length > 0; // the non-empty accessPointNames indicates PDN enabled
    let pdnState = PDN_DEFAULT_STATE;
    if (lteEnabled && !pdnEnabled) pdnState = PDN_LOADING_STATE;
    if (lteEnabled && pdnEnabled) pdnState = PDN_SUCCESS_STATE;
    if (pdnFailed) pdnState = PDN_FAIL_STATE;
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (lteEnabled && !pdnEnabled) {
            timer = setTimeout(() => {
                setPdnFailed(true);
            }, STATUS_CHECK_TIMEOUT);
        }
        return () => {
            setPdnFailed(false);
            clearTimeout(timer);
        };
    }, [lteEnabled, pdnEnabled]);

    return (
        <CollapsibleGroup
            heading="Connection Status"
            defaultCollapsed={getCollapseConnectionStatusSection()}
            onToggled={isNowExpanded =>
                setCollapseConnectionStatusSection(!isNowExpanded)
            }
        >
            <div className="connection-status-container">
                <Steppers
                    steps={[
                        traceState,
                        modemState,
                        simState,
                        lteState,
                        pdnState,
                    ]}
                />
            </div>
        </CollapsibleGroup>
    );
};
