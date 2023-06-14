/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ConfirmationDialog, usageData } from 'pc-nrfconnect-shared';

import { readRawTrace } from '../../features/tracing/nrfml';
import {
    getManualDbFilePath,
    getSerialPort,
    setDetectTraceDbFailed,
    setManualDbFilePath,
} from '../../features/tracing/traceSlice';
import EventAction from '../../usageDataActions';
import { askForTraceFile } from '../../utils/fileUtils';
import DatabaseFileOverride from './DatabaseFileOverride';

export const LoadTraceFile = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [filePath, setFilePath] = useState<string>();
    const hasSerialPort = useSelector(getSerialPort) != null;
    const dbFilePath = useSelector(getManualDbFilePath);
    const [showTraceDbSelector, setShowTraceDbSelector] = useState(false);

    const readRawFile = async () => {
        // Reset selected trace db
        dispatch(setManualDbFilePath(undefined));

        // Ask for file
        const path = await askForTraceFile();
        setFilePath(path);

        // Ask for trace db
        setShowTraceDbSelector(true);
    };

    useEffect(() => {
        // User selected db and closed the dialog
        if (!showTraceDbSelector && dbFilePath && filePath) {
            dispatch(setDetectTraceDbFailed(false));
            dispatch(readRawTrace(filePath, setLoading));
            setFilePath(undefined);
            usageData.sendUsageData(EventAction.READ_TRACE_FILE);
        }
    }, [dbFilePath, showTraceDbSelector, dispatch, filePath]);

    return (
        <>
            <ConfirmationDialog
                confirmLabel="Use selected trace database"
                isVisible={showTraceDbSelector}
                onConfirm={() => setShowTraceDbSelector(false)}
                onCancel={() => {
                    setFilePath(undefined);
                    setShowTraceDbSelector(false);
                }}
            >
                <p>Please select modem trace database to be used:</p>
                <DatabaseFileOverride disableAutoSelect />
            </ConfirmationDialog>
            <Button
                className={`w-100 ${loading && 'active-animation'}`}
                onClick={readRawFile}
                disabled={loading || hasSerialPort}
                variant="secondary"
            >
                {loading === true ? 'Reading trace file' : 'Load trace file...'}
            </Button>
        </>
    );
};
