/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getTraceSerialPort } from '../../tracing/traceSlice';
import DetectTraceDbDialog from './DetectTraceDbDialog';
import StartStopTrace from './StartStopTrace';

export default () => {
    const selectedSerialPort = useSelector(getTraceSerialPort);

    if (!selectedSerialPort) {
        return null;
    }

    return (
        <>
            <StartStopTrace />
            <DetectTraceDbDialog />
        </>
    );
};
