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
    Group,
    telemetry,
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

    const [readTraceFile, setReadTraceFile] = useState(false);
    const [loadTraceInWireshark, setLoadTraceInWireshark] = useState(false);

    const isLoadTraceEnabled = isWiresharkInstalled();
    const noWiresharkWarning = isLoadTraceEnabled
        ? undefined
        : 'Install Wireshark to use this feature';

    const readRawFile = async (readType: 'readTrace' | 'readWireshark') => {
        console.log('----- read raw file', filePath);
        console.log('--- readType', readType);
        console.log('--- readTraceFile', readTraceFile);
        console.log('--- loadTraceInWireshark', loadTraceInWireshark);
        console.log('-----');

        if (filePath) {
            if (readType === 'readTrace') {
                startReadingFile();
            } else {
                loadTrace();
            }

            return;
        }

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

        setReadTraceFile(false); // reset state
        console.log('--> setReadTraceFile(false);');

        telemetry.sendEvent(EventAction.READ_TRACE_FILE);
    };

    const loadTrace = () => {
        if (filePath == null) return;

        dispatch(convertTraceFile(filePath, setLoading));

        setLoadTraceInWireshark(false); // reset state
        console.log('--> setLoadTraceInWireshark(false);');

        telemetry.sendEvent(EventAction.OPEN_TRACE_IN_WIRESHARK);
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
                onClick={async () => {
                    setReadTraceFile(true);
                    await readRawFile('readTrace');
                }}
                disabled={loading || hasSerialPort} // todo: check why not !hasSerialPort
                variant="secondary"
                title="Reads the trace file and shows the content in the dashboard."
            >
                {loading
                    ? 'Loading trace file'
                    : `Load trace file${filePath ? '' : '...'}`}
            </Button>

            <Button
                className="w-100"
                onClick={async () => {
                    setLoadTraceInWireshark(true);
                    await readRawFile('readWireshark');
                }}
                disabled={loading || !isLoadTraceEnabled}
                variant="secondary"
                title={noWiresharkWarning}
            >
                {`Open trace file in Wireshark${filePath ? '' : '...'}`}
            </Button>
            {filePath && (
                <Button
                    className="w-100"
                    onClick={() => {
                        setLoadTraceInWireshark(false);
                        setReadTraceFile(false);
                        setFilePath(undefined);
                    }}
                    disabled={loading}
                    variant="secondary"
                >
                    Clear file selection
                </Button>
            )}

            {filePath && (
                <Group heading="FILE INFORMATION" className="tw-mt-6">
                    <div>
                        <div className="tw-border tw-border-b-0 tw-border-solid tw-border-gray-200 tw-p-2">
                            <p className="tw-mb-0 tw-text-xs">Loaded file:</p>
                            <p className="tw-mb-0 tw-mt-1 tw-text-xs">
                                {fileName}
                            </p>
                        </div>

                        <DatabaseFileOverride previewMode />
                    </div>
                </Group>
            )}
        </>
    );
};
