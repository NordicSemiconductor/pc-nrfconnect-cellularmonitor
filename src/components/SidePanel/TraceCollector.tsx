/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { TraceFormat } from '../../features/tracing/traceFormat';
import { getIsTracing, getSerialPort } from '../../features/tracing/traceSlice';
import { getTraceFormat as getStoredTraceFormat } from '../../utils/store';
import DetectTraceDbDialog from './DetectTraceDbDialog';
import Serialports from './Serialports';
import StartStopTrace from './StartStopTrace';
import TraceFormatSelector from './TraceFormatSelector';

export default () => {
    const isTracing = useSelector(getIsTracing);
    const [selectedTraceFormat, setSelectedTraceFormat] = useState<TraceFormat>(
        getStoredTraceFormat()
    );

    const selectedSerialPort = useSelector(getSerialPort);

    if (!selectedSerialPort) {
        return null;
    }

    return (
        <>
            <Serialports
                disabled={isTracing}
                selectedSerialPort={selectedSerialPort}
            />
            <TraceFormatSelector
                selectedTraceFormat={selectedTraceFormat}
                setSelectedTraceFormat={setSelectedTraceFormat}
                isTracing={isTracing}
            />
            <StartStopTrace traceFormat={selectedTraceFormat} />
            <DetectTraceDbDialog />
            <hr />
        </>
    );
};
