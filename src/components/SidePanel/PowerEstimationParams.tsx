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

import { OPE_URL } from '../../features/powerEstimation/onlinePowerEstimator';
import {
    getData,
    getFilePath,
    setFilePath,
} from '../../features/powerEstimation/powerEstimationSlice';
import { extractPowerData } from '../../features/tracing/nrfml';
import {
    getIsDeviceSelected,
    getIsTracing,
} from '../../features/tracing/traceSlice';
import { askForTraceFile } from '../../utils/fileUtils';
import {
    getCollapsePowerSection,
    setCollapsePowerSection,
} from '../../utils/store';
import TraceFileDetails from './Tracing/TraceFileDetails';

import '../PowerEstimation/powerEstimation.scss';

const GetPowerDataFromFile = () => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);

    const getPowerData = () => {
        const file = askForTraceFile();
        if (file) {
            dispatch(extractPowerData(file));
        }
    };

    return (
        <Button
            className="w-100 secondary-btn"
            variant="secondary"
            onClick={getPowerData}
            disabled={isTracing}
        >
            {isTracing ? 'Fetching data...' : 'Get power data from RAW'}
        </Button>
    );
};

const SavePowerDataFromRunningTrace = () => {
    const dispatch = useDispatch();

    const powerData = useSelector(getData);

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
        writeFile(filePath, JSON.stringify(powerData), () => {
            dispatch(setFilePath(filePath));
        });
    };

    const powerDataExists = powerData != null;
    const title = powerDataExists
        ? 'Save power estimation data to file'
        : 'Click Start tracing to get power estimation data from trace';
    const label = powerDataExists
        ? 'Save power estimation data'
        : 'Waiting for power data...';

    return (
        <Button
            variant="secondary"
            disabled={!powerDataExists}
            className="w-100"
            title={title}
            onClick={onSave}
        >
            {label}
        </Button>
    );
};

const PowerEstimationDataInfo = () => {
    const powerEstimationFilePath = useSelector(getFilePath);

    if (powerEstimationFilePath == null) {
        return null;
    }

    return (
        <div className="opp-result-wrapper">
            <TraceFileDetails
                progress={{
                    format: 'opp',
                    path: powerEstimationFilePath,
                }}
                label="Power estimation data"
            />
            <Button
                variant="secondary"
                className="w-100"
                onClick={() => openUrl(OPE_URL)}
            >
                Open Online Power Estimator
            </Button>
        </div>
    );
};

export default () => {
    const isDeviceSelected = useSelector(getIsDeviceSelected);

    return (
        <CollapsibleGroup
            heading="Power Estimation"
            defaultCollapsed={getCollapsePowerSection()}
            onToggled={isNowExpanded => setCollapsePowerSection(!isNowExpanded)}
        >
            {isDeviceSelected ? (
                <SavePowerDataFromRunningTrace />
            ) : (
                <GetPowerDataFromFile />
            )}
            <PowerEstimationDataInfo />
        </CollapsibleGroup>
    );
};
