/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logger, StartStopButton } from 'pc-nrfconnect-shared';

import { startTrace, stopTrace } from '../../../features/tracing/nrfml';
import {
    getIsTracing,
    getTraceFormats,
} from '../../../features/tracing/traceSlice';

export default () => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const traceFormats = useSelector(getTraceFormats);
    const [coolingDown, setCoolingDown] = useState(false);

    const start = () => {
        dispatch(startTrace(traceFormats));
    };

    const stop = () => {
        try {
            dispatch(stopTrace());
        } catch (e) {
            // This is expected to fail sometimes, not sure why it does, but the event is complete.
            logger.debug('Error stopping trace', e);
        }

        // Don't let the user immediately start a new trace, since monitor-lib needs to clean up a bit first
        setCoolingDown(true);
        setTimeout(() => {
            setCoolingDown(false);
        }, 2000);
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
            disabled={(!isTracing && traceFormats.length === 0) || coolingDown}
        />
    );
};
