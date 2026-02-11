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
    telemetry, Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../app/usageDataActions';
import { askForTraceFile } from '../../common/fileUtils';
import {convertTraceFile, readRawTrace} from '../tracing/nrfml';
import {getTraceSerialPort, setManualDbFilePath, setRefreshOnStart} from '../tracing/traceSlice';
import DatabaseFileOverride from './DatabaseFileOverride';
import {isWiresharkInstalled} from "../wireshark/wireshark";

export const LoadTraceFileGlobal = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [filePath, setFilePath] = useState<string>();
    const hasSerialPort = useSelector(getTraceSerialPort) != null;
    const [showTraceDbSelector, setShowTraceDbSelector] = useState(false);

    const [readTraceFile, setReadTraceFile] = useState(true);
    const [loadTraceInWireshark, setLoadTraceInWireshark] = useState(false);

    const isLoadTraceEnabled = isWiresharkInstalled();
    const noWiresharkWarning = isLoadTraceEnabled ? undefined : 'Install wireshark to use this feature';

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
        if (filePath == null) return;

        dispatch(readRawTrace(filePath, setLoading));
        // setFilePath(undefined);
        telemetry.sendEvent(EventAction.READ_TRACE_FILE);
    };

    const loadTrace = () => {
        if (filePath == null) return;

        telemetry.sendEvent(EventAction.OPEN_TRACE_IN_WIRESHARK);
        dispatch(convertTraceFile(filePath, setLoading));
    };

    const fileName = filePath ? filePath.split(/[/\\]/).pop() : '';
    return (
        <>
            <ConfirmationDialog
                confirmLabel="Use selected trace database"
                isVisible={showTraceDbSelector}
                onConfirm={() => {
                    setShowTraceDbSelector(false);
                    if (readTraceFile) {
                        startReadingFile();
                    }
                    if (loadTraceInWireshark) {
                        loadTrace();
                    }
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
                disabled={loading || hasSerialPort || (!readTraceFile && !loadTraceInWireshark)}
                variant="secondary"
            >
                {loading ? 'Loading trace file' : 'Load trace file'}
            </Button>

            <Toggle
                label="Read trace file"
                disabled={loading}
                isToggled={readTraceFile}
                onToggle={toggled => setReadTraceFile(toggled)}
                title="Reads the trace file and shows the content in the dashboard."
            />
            <Toggle
                label="Open trace file in Wireshark"
                disabled={loading || !isLoadTraceEnabled}
                isToggled={loadTraceInWireshark}
                onToggle={toggled => setLoadTraceInWireshark(toggled)}
                title={noWiresharkWarning}
            />

            {
                filePath && (
                    <div>
                        <p className="tw-text-xs mb-0">Loaded file:</p>
                        <p className="tw-text-xs mb-1">{fileName}</p>
                        <DatabaseFileOverride disabled />
                    </div>
                )
            }
        </>
    );
};
