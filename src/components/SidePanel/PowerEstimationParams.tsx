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
import {
    CollapsibleGroup,
    getAppDataDir,
    openUrl,
    usageData,
} from 'pc-nrfconnect-shared';

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
import { findTshark } from '../../features/wireshark/wireshark';
import { getTsharkPath } from '../../features/wireshark/wiresharkSlice';
import EventAction from '../../usageDataActions';
import { askForTraceFile } from '../../utils/fileUtils';
import {
    getCollapsePowerSection,
    setCollapsePowerSection,
} from '../../utils/store';
import TraceFileDetails from './Tracing/TraceFileDetails';

import '../PowerEstimation/powerEstimation.scss';

const GetPowerDataFromFile = ({ isTracing }: { isTracing: boolean }) => {
    const dispatch = useDispatch();

    const selectedTsharkPath = useSelector(getTsharkPath);
    const isTsharkInstalled = !!findTshark(selectedTsharkPath);

    const getPowerData = () => {
        const file = askForTraceFile();
        if (file) {
            dispatch(extractPowerData(file));
        }
    };

    return (
        <Button
            className="w-100 secondary-btn btn-sm"
            variant="secondary"
            onClick={getPowerData}
            disabled={isTracing || !isTsharkInstalled}
            title={
                isTsharkInstalled
                    ? ''
                    : 'tshark is not installed, cannot get power data'
            }
        >
            {isTracing ? 'Fetching data...' : 'Get power data from RAW'}
        </Button>
    );
};

const SavePowerDataFromRunningTrace = ({
    isTracing,
    isDeviceSelected,
}: {
    isTracing: boolean;
    isDeviceSelected: boolean;
}) => {
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
    let title = 'Click Start tracing to get power estimation data from trace';
    let label;
    if (powerDataExists || !isDeviceSelected) {
        label = 'Save power estimation data';
        title = 'Save power estimation data to file';
    } else if (isTracing) {
        label = 'Waiting for power data...';
    } else {
        label = 'Start trace to get power data...';
    }

    return (
        <Button
            variant="secondary"
            disabled={!powerDataExists}
            className="w-100 btn-sm"
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
        </div>
    );
};

export default () => {
    const isDeviceSelected = useSelector(getIsDeviceSelected);
    const isTracing = useSelector(getIsTracing);

    return (
        <CollapsibleGroup
            heading="Power Estimation"
            defaultCollapsed={getCollapsePowerSection()}
            onToggled={isNowExpanded => setCollapsePowerSection(!isNowExpanded)}
        >
            {!isDeviceSelected && (
                <GetPowerDataFromFile isTracing={isTracing} />
            )}
            <SavePowerDataFromRunningTrace
                isTracing={isTracing}
                isDeviceSelected={isDeviceSelected}
            />
            <PowerEstimationDataInfo />
            <p style={{ marginTop: 8 }}>
                Visit the Online Power Profiler for the full feature set. Saved
                settings can also be imported there.
            </p>
            <Button
                variant="secondary"
                className="w-100 btn-sm"
                onClick={() => {
                    usageData.sendUsageData(EventAction.VISIT_OPP);
                    openUrl(OPE_URL);
                }}
            >
                Open Online Power Profiler
            </Button>
        </CollapsibleGroup>
    );
};
