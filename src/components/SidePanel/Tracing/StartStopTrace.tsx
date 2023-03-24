/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StartStopButton } from 'pc-nrfconnect-shared';

import { TraceFormat } from '../../../features/tracing/formats';
import { startTrace, stopTrace } from '../../../features/tracing/nrfml';
import { getIsTracing, getTaskId } from '../../../features/tracing/traceSlice';

type StartStopProps = {
    traceFormats: TraceFormat[];
};

export default ({ traceFormats = [] }: StartStopProps) => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const nrfmlTaskId = useSelector(getTaskId);

    const start = () => {
        dispatch(startTrace(traceFormats));
    };

    const stop = () => {
        dispatch(stopTrace(nrfmlTaskId));
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
