/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'pc-nrfconnect-shared';

import { readRawTrace } from '../../features/tracing/nrfml';
import { getIsTracing } from '../../features/tracing/traceSlice';
import { askForTraceFile } from '../../utils/fileUtils';

export const LoadTraceFile = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const isTracing = useSelector(getIsTracing);

    const readRawFile = () => {
        const sourceFile = askForTraceFile();

        if (!sourceFile) {
            console.error('Could not select the provided file.');
            return;
        }
        dispatch(readRawTrace(sourceFile, setLoading));
    };

    return (
        <Button
            className={`w-100 ${loading && 'active-animation'}`}
            onClick={readRawFile}
            disabled={loading || isTracing}
            variant="secondary"
        >
            {loading === true
                ? 'Reading trace file'
                : 'Read Trace from Raw File'}
        </Button>
    );
};
