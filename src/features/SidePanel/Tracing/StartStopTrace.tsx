/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    logger,
    StartStopButton,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { startTrace, stopTrace } from '../../tracing/nrfml';
import {
    getIsTracing,
    getOpenInWiresharkSelected,
    getTraceFormats,
} from '../../tracing/traceSlice';
import InstallWiresharkDialog from '../../wireshark/InstallWiresharkDialog';
import { defaultSharkPath } from '../../wireshark/wireshark';
import { getWiresharkPath } from '../../wireshark/wiresharkSlice';

export default () => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const traceFormats = useSelector(getTraceFormats);
    const openWiresharkOnStart = useSelector(getOpenInWiresharkSelected);
    const wiresharkPath = useSelector(getWiresharkPath);
    const [disabled, setDisabled] = useState(false);
    const [showWiresharkDialog, setShowWiresharkDialog] = useState(false);

    const start = () => {
        const locatedWireshark = wiresharkPath ?? defaultSharkPath();
        if (openWiresharkOnStart && !locatedWireshark) {
            setShowWiresharkDialog(true);
        } else {
            dispatch(startTrace(traceFormats));
        }
    };

    const stop = () => {
        try {
            dispatch(stopTrace());
        } catch (e) {
            // This is expected to fail sometimes, not sure why it does, but the event is complete.
            logger.debug('Error stopping trace', e);
        }
    };

    const disableForAWhile = () => {
        // Don't let the user immediately start a new trace, since monitor-lib needs to clean up a bit first
        setDisabled(true);
        setTimeout(() => {
            setDisabled(false);
        }, 2000);
    };

    // Wait for AT modem detection on first render for 2s
    useEffect(() => disableForAWhile(), []);

    return (
        <>
            <StartStopButton
                variant="secondary"
                onClick={() => {
                    disableForAWhile();
                    if (isTracing) stop();
                    else start();
                }}
                started={isTracing}
                startText="Start"
                stopText="Stop"
                disabled={(!isTracing && traceFormats.length === 0) || disabled}
            />
            <InstallWiresharkDialog
                isVisible={showWiresharkDialog}
                setIsVisible={setShowWiresharkDialog}
            />
        </>
    );
};
