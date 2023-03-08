/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dialog } from '@electron/remote';
import { writeFile } from 'fs';
import { join } from 'path';
import {
    Button,
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
import {
    getIsDeviceSelected,
    getIsTracing,
} from '../../features/tracing/traceSlice';
import EventAction from '../../usageDataActions';
import {
    getCollapsePowerSection,
    setCollapsePowerSection,
} from '../../utils/store';
import TraceFileDetails from './Tracing/TraceFileDetails';

import '../PowerEstimation/powerEstimation.scss';

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
        const { filePath, canceled } = await dialog.showSaveDialog({
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
                    format: 'tshark',
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
