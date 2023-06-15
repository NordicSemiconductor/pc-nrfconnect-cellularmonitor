/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ConfirmationDialog, usageData } from 'pc-nrfconnect-shared';

import { readRawTrace } from '../../features/tracing/nrfml';
import {
    getSerialPort,
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

    const startReadingFile = () => {
        if (filePath != null) {
            dispatch(readRawTrace(filePath, setLoading));
            setFilePath(undefined);
            usageData.sendUsageData(EventAction.READ_TRACE_FILE);
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
                {loading === true ? 'Reading trace file' : 'Load trace file...'}
            </Button>
        </>
    );
};
