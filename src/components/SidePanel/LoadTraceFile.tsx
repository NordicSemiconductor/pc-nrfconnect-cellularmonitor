/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, InfoDialog, usageData } from 'pc-nrfconnect-shared';

import { readRawTrace } from '../../features/tracing/nrfml';
import {
    getDetectTraceDbFailed,
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
    const detectTraceDbFailed = useSelector(getDetectTraceDbFailed);
    const dbFilePath = useSelector(getManualDbFilePath);

    const readRawFile = async () => {
        const path = await askForTraceFile();
        setFilePath(path);
        if (path) {
            usageData.sendUsageData(EventAction.READ_TRACE_FILE);
            dispatch(setManualDbFilePath(undefined));
            dispatch(readRawTrace(path, setLoading));
        }
    };

    useEffect(() => {
        if (detectTraceDbFailed && dbFilePath && filePath) {
            dispatch(setDetectTraceDbFailed(false));
            dispatch(readRawTrace(filePath, setLoading));
        }
    }, [dbFilePath, detectTraceDbFailed, dispatch, filePath]);

    return (
        <>
            <InfoDialog
                isVisible={detectTraceDbFailed && !dbFilePath}
                onHide={() => dispatch(setDetectTraceDbFailed(false))}
            >
                <p>
                    Could not determine the type of modem trace database used,
                    please select one
                </p>
                <DatabaseFileOverride />
            </InfoDialog>
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
