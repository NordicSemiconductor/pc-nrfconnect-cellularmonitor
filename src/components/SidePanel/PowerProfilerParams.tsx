/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';
import { remote } from 'electron';
import { writeFile } from 'fs';
import { join } from 'path';
import { CollapsibleGroup, getAppDataDir, openUrl } from 'pc-nrfconnect-shared';

import { extractPowerData } from '../../features/tracing/nrfml';
import {
    getOppData,
    getOppFilePath,
    getSerialPort,
    setOPPFilePath,
} from '../../features/tracing/traceSlice';
import { askForTraceFile } from '../../utils/fileUtils';
import { TraceFileDetails } from './Tracing/TraceFileInformation';

export default () => {
    const dispatch = useDispatch();
    const isDeviceSelected = !!useSelector(getSerialPort);

    const oppData = useSelector(getOppData);
    const oppFilePath = useSelector(getOppFilePath);

    const onSave = async () => {
        const { filePath, canceled } = await remote.dialog.showSaveDialog({
            defaultPath: join(getAppDataDir(), 'power-calculator-data.json'),
            filters: [
                {
                    name: 'JSON',
                    extensions: ['json'],
                },
            ],
        });
        if (canceled || !filePath) return;
        writeFile(filePath, JSON.stringify(oppData), () => {
            dispatch(setOPPFilePath(filePath));
        });
    };

    const getPowerData = () => {
        const file = askForTraceFile();
        if (file) {
            dispatch(extractPowerData(file));
        }
    };

    return (
        <CollapsibleGroup heading="Power Calculator" defaultCollapsed={false}>
            {!isDeviceSelected ? (
                <Button
                    className="w-100 secondary-btn"
                    variant="secondary"
                    onClick={getPowerData}
                >
                    Get power data from RAW
                </Button>
            ) : (
                <>
                    {oppData == null ? (
                        <Button
                            variant="secondary"
                            disabled
                            className="w-100"
                            title="Start trace to extract data for power calculation"
                        >
                            Waiting for power data...
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className="w-100"
                            onClick={onSave}
                        >
                            Save power estimation data
                        </Button>
                    )}
                </>
            )}
            {oppFilePath != null && (
                <div className="opp-result-wrapper">
                    <TraceFileDetails
                        progress={{
                            format: 'opp',
                            path: oppFilePath,
                        }}
                        label="Power calculator data"
                        truncate={false}
                    />
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() =>
                            openUrl(
                                'https://devzone.nordicsemi.com/power/w/opp/3/online-power-profiler-for-lte'
                            )
                        }
                    >
                        Open Online Power Profiler
                    </Button>
                </div>
            )}
        </CollapsibleGroup>
    );
};
