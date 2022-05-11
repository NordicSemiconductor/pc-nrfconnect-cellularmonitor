/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';

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

    return isTracing ? (
        <Button
            className="w-100 secondary-btn start-stop active-animation"
            variant="secondary"
            onClick={stop}
        >
            <span className="mdi mdi-stop-circle" />
            Stop tracing
        </Button>
    ) : (
        <Button
            className="w-100 secondary-btn start-stop"
            variant="secondary"
            onClick={start}
            disabled={traceFormats.length === 0}
        >
            <span className="mdi mdi-play-circle" />
            Start tracing
        </Button>
    );
};
