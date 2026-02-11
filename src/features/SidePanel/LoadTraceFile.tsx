/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    ConfirmationDialog,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../app/usageDataActions';
import { askForTraceFile } from '../../common/fileUtils';
import { readRawTrace } from '../tracing/nrfml';
import { getTraceSerialPort, setManualDbFilePath } from '../tracing/traceSlice';
import DatabaseFileOverride from './DatabaseFileOverride';

export const LoadTraceFile = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [filePath, setFilePath] = useState<string>();
    const hasSerialPort = useSelector(getTraceSerialPort) != null;
    const [showTraceDbSelector, setShowTraceDbSelector] = useState(false);

    const readRawFile = async () => {
        // Reset selected trace db
        dispatch(setManualDbFilePath(undefined));

        // Ask for file
        const path = await askForTraceFile();

        if (!path) {
            return;
        }

        setFilePath(path);

        // Ask for trace db
        setShowTraceDbSelector(true);
    };

    const startReadingFile = () => {
        if (filePath != null) {
            dispatch(readRawTrace(filePath, setLoading));
            setFilePath(undefined);
            telemetry.sendEvent(EventAction.READ_TRACE_FILE);
        }
    };

    return (
        <>
            <ConfirmationDialog
                confirmLabel="Use selected trace database"
                isVisible={showTraceDbSelector}
                onConfirm={() => {
                    setShowTraceDbSelector(false);
                    startReadingFile();
                }}
                onCancel={() => {
                    setFilePath(undefined);
                    setShowTraceDbSelector(false);
                }}
            >
                <p>Please select modem trace database to be used:</p>
                <DatabaseFileOverride />
            </ConfirmationDialog>
            <Button
                className={`w-100 ${loading && 'active-animation'}`}
                onClick={readRawFile}
                disabled={loading || hasSerialPort}
                variant="secondary"
            >
                {loading ? 'Reading trace file' : 'Load trace file...'}
            </Button>
            <p>{filePath}</p>
        </>
    );
};
