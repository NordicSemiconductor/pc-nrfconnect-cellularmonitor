/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    ConfirmationDialog, Group,
    telemetry,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../app/usageDataActions';
import { askForTraceFile } from '../../common/fileUtils';
import { convertTraceFile, readRawTrace } from '../tracing/nrfml';
import { getTraceSerialPort, setManualDbFilePath } from '../tracing/traceSlice';
import { isWiresharkInstalled } from '../wireshark/wireshark';
import DatabaseFileOverride from './DatabaseFileOverride';

export const LoadTraceFile = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [filePath, setFilePath] = useState<string>();
    const hasSerialPort = useSelector(getTraceSerialPort) != null;
    const [showTraceDbSelector, setShowTraceDbSelector] = useState(false);

    const [readTraceFile, setReadTraceFile] = useState(true);
    const [loadTraceInWireshark, setLoadTraceInWireshark] = useState(false);

    const isLoadTraceEnabled = isWiresharkInstalled();
    const noWiresharkWarning = isLoadTraceEnabled
        ? undefined
        : 'Install wireshark to use this feature';

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
                disabled={
                    loading ||
                    hasSerialPort ||
                    (!readTraceFile && !loadTraceInWireshark)
                }
                variant="secondary"
            >
                {loading ? 'Loading trace file' : 'Load trace file'}
            </Button>

            <div className="tw-pt-2 tw-flex tw-flex-col tw-gap-2">
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
            </div>

            {filePath && (
                <Group heading="FILE INFORMATION" className="tw-mt-6">
                    <div>
                        <div className="tw-border tw-border-solid tw-border-gray-200 tw-p-2 tw-border-b-0">
                            <p className="tw-mb-0 tw-text-xs">Loaded file:</p>
                            <p className="tw-mb-0 tw-mt-1 tw-text-xs">{fileName}</p>
                        </div>

                        <DatabaseFileOverride previewMode />
                    </div>
                </Group>
            )}
        </>
    );
};
