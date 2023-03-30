/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StartStopButton } from 'pc-nrfconnect-shared';

import { startTrace, stopTrace } from '../../../features/tracing/nrfml';
import {
    getIsTracing,
    getTraceFormats,
} from '../../../features/tracing/traceSlice';

export default () => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const traceFormats = useSelector(getTraceFormats);

    const start = () => {
        dispatch(startTrace(traceFormats));
    };

    const stop = () => {
        dispatch(stopTrace());
    };

    return (
        <StartStopButton
            variant="secondary"
            onClick={() => {
                if (isTracing) stop();
                else start();
            }}
            started={isTracing}
            startText="Start"
            stopText="Stop"
            disabled={!isTracing && traceFormats.length === 0}
        />
    );
};
