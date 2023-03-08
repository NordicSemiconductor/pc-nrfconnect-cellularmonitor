/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, logger, usageData } from 'pc-nrfconnect-shared';

import {
    getManualDbFilePath,
    resetManualDbFilePath,
    setManualDbFilePath,
} from '../../features/tracing/traceSlice';
import EventAction from '../../usageDataActions';
import { askForTraceDbFile } from '../../utils/fileUtils';
import FilePathLink from './FilePathLink';

const HelpOnTraceDb = () => (
    <span
        className="mdi mdi-help-circle-outline advanced-options-help"
        title="A trace database file is used to decode trace data"
    />
);

const SelectTraceDbManually = () => {
    const dispatch = useDispatch();

    const updateManualDbFilePath = () => {
        const manualDbPath = askForTraceDbFile();
        if (manualDbPath) {
            dispatch(setManualDbFilePath(manualDbPath));
            usageData.sendUsageData(EventAction.SET_TRACE_DB_MANUALLY);
            logger.info(
                `Database path successfully updated to ${manualDbPath}`
            );
        }
    };

    return (
        <Button
            className="w-100 secondary-btn"
            onClick={updateManualDbFilePath}
        >
            Select Trace DB
        </Button>
    );
};

const SelectTraceDbAutomatically = () => {
    const dispatch = useDispatch();

    const selectTraceDbAutomatically = () => {
        dispatch(resetManualDbFilePath());
        logger.info(`Database path successfully reset to default value`);
    };

    return (
        <Button
            className="w-100 secondary-btn"
            onClick={selectTraceDbAutomatically}
        >
            Autoselect Trace DB
        </Button>
    );
};

const FilePathLabel = () => (
    <div className="db-help-section">
        <span>Override trace database</span>
        <HelpOnTraceDb />
    </div>
);

export default () => {
    const manualDbFilePath = useSelector(getManualDbFilePath);

    if (manualDbFilePath == null) {
        return (
            <>
                <div className="db-help-section">
                    <div>Trace database</div>
                    <HelpOnTraceDb />
                </div>
                <p>
                    A trace database matching the modem firmware of your device
                    is automatically chosen. You can also select one explicitly.
                </p>
                <SelectTraceDbManually />
            </>
        );
    }

    return (
        <>
            <FilePathLink
                filePath={manualDbFilePath}
                label={<FilePathLabel />}
            />
            <SelectTraceDbManually />
            <SelectTraceDbAutomatically />
        </>
    );
};
