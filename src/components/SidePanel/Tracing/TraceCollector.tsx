/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { TraceFormat } from '../../../features/tracing/formats';
import { getSerialPort } from '../../../features/tracing/traceSlice';
import { getTraceFormats as getStoredTraceFormats } from '../../../utils/store';
import DetectTraceDbDialog from './DetectTraceDbDialog';
import StartStopTrace from './StartStopTrace';

export default () => {
    const selectedSerialPort = useSelector(getSerialPort);

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
