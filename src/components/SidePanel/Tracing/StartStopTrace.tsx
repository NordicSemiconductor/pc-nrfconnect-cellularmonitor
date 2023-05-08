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
    getOpenInWiresharkSelected,
    getTraceFormats,
} from '../../../features/tracing/traceSlice';
import { getWiresharkPath } from '../../../features/wireshark/wiresharkSlice';
import InstallWiresharkDialog from '../../InstallWiresharkDialog';

export default () => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const traceFormats = useSelector(getTraceFormats);
    const openWiresharkOnStart = useSelector(getOpenInWiresharkSelected);
    const wiresharkPath = useSelector(getWiresharkPath);
    const [waitForCleanup, setWaitForCleanup] = useState(false);
    const [showWiresharkDialog, setShowWiresharkDialog] = useState(true);

    const start = () => {
        if (openWiresharkOnStart && !wiresharkPath) {
            setShowWiresharkDialog(true);
        }
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
        setWaitForCleanup(true);
        setTimeout(() => {
            setWaitForCleanup(false);
        }, 2000);
    };

    return (
        <>
            <StartStopButton
                variant="secondary"
                onClick={() => {
                    if (isTracing) stop();
                    else start();
                }}
                started={isTracing}
                startText="Start"
                stopText="Stop"
                disabled={
                    (!isTracing && traceFormats.length === 0) || waitForCleanup
                }
            />
            <InstallWiresharkDialog
                isVisible={showWiresharkDialog}
                setIsVisible={setShowWiresharkDialog}
            />
        </>
    );
};
