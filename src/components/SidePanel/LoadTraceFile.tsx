/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, usageData } from 'pc-nrfconnect-shared';

import { readRawTrace } from '../../features/tracing/nrfml';
import { getSerialPort } from '../../features/tracing/traceSlice';
import EventAction from '../../usageDataActions';
import { askForTraceFile } from '../../utils/fileUtils';

export const LoadTraceFile = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const hasSerialPort = useSelector(getSerialPort) != null;

    const readRawFile = () => {
        const sourceFile = askForTraceFile();

        if (!sourceFile) {
            console.error('Could not select the provided file.');
            return;
        }

        usageData.sendUsageData(EventAction.READ_TRACE_FILE);
        dispatch(readRawTrace(sourceFile, setLoading));
    };

    return (
        <Button
            className={`w-100 ${loading && 'active-animation'}`}
            onClick={readRawFile}
            disabled={loading || hasSerialPort}
            variant="secondary"
        >
            {loading === true ? 'Reading trace file' : 'Load trace file...'}
        </Button>
    );
};
