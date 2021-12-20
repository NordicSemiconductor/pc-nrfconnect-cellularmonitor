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
    getPowerEstimationData,
    getPowerEstimationFilePath,
    getSerialPort,
    setPowerEstimationFilePath,
} from '../../features/tracing/traceSlice';
import { askForTraceFile } from '../../utils/fileUtils';
import {
    getCollapsePowerSection,
    setCollapsePowerSection,
} from '../../utils/store';
import { TraceFileDetails } from './Tracing/TraceFileInformation';

export default () => {
    const dispatch = useDispatch();
    const isDeviceSelected = !!useSelector(getSerialPort);

    const powerEstimationData = useSelector(getPowerEstimationData);
    const powerEstimationFilePath = useSelector(getPowerEstimationFilePath);

    const onSave = async () => {
        const { filePath, canceled } = await remote.dialog.showSaveDialog({
            defaultPath: join(getAppDataDir(), 'power-estimation-data.json'),
            filters: [
                {
                    name: 'JSON',
                    extensions: ['json'],
                },
            ],
        });
        if (canceled || !filePath) return;
        writeFile(filePath, JSON.stringify(powerEstimationData), () => {
            dispatch(setPowerEstimationFilePath(filePath));
        });
    };

    const getPowerData = () => {
        const file = askForTraceFile();
        if (file) {
            dispatch(extractPowerData(file));
        }
    };

    return (
        <CollapsibleGroup
            heading="Power Estimator"
            defaultCollapsed={getCollapsePowerSection()}
            onToggled={isNowExpanded => setCollapsePowerSection(!isNowExpanded)}
        >
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
                    {powerEstimationData == null ? (
                        <Button
                            variant="secondary"
                            disabled
                            className="w-100"
                            title="Click Start trace to get power estimation data from trace"
                        >
                            Waiting for power data...
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className="w-100"
                            onClick={onSave}
                            title="Save power estimation data to file"
                        >
                            Save power estimation data
                        </Button>
                    )}
                </>
            )}
            {powerEstimationFilePath != null && (
                <div className="opp-result-wrapper">
                    <TraceFileDetails
                        progress={{
                            format: 'opp',
                            path: powerEstimationFilePath,
                        }}
                        label="Power estimator data"
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
                        Open Online Power Estimator
                    </Button>
                </div>
            )}
        </CollapsibleGroup>
    );
};
