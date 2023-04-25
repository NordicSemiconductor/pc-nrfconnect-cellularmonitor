/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, {
    ProgressCallback,
} from '@nordicsemiconductor/nrf-monitor-lib-js';
import { logger } from 'pc-nrfconnect-shared';
import { Dispatch } from 'redux';

import {
    setDetectingTraceDb,
    setManualDbFilePath,
    setTraceProgress,
} from './traceSlice';

type MetaField = nrfml.MetaFields[keyof nrfml.MetaFields];

const noop: ProgressCallback = () => {};

const makeDetectModemFwUuid = () => {
    let detectedModemFwUuid: MetaField;

    return (progress: nrfml.Progress) => {
        const reportedModemFwUuid = progress.meta?.modem_db_uuid;

        if (
            detectedModemFwUuid == null &&
            detectedModemFwUuid !== reportedModemFwUuid
        ) {
            detectedModemFwUuid = reportedModemFwUuid;
            logger.info(
                `Detected modem firmware with UUID ${detectedModemFwUuid}`
            );
        }
    };
};

const makeDetectTraceDB = (dispatch: Dispatch) => {
    let detectedTraceDB: MetaField;

    return (progress: nrfml.Progress) => {
        const reportedTraceDB = progress.meta?.modem_db_path;

        if (detectedTraceDB == null && detectedTraceDB !== reportedTraceDB) {
            detectedTraceDB = reportedTraceDB;
            dispatch(setManualDbFilePath(reportedTraceDB as string));
            logger.info(`Using trace DB ${detectedTraceDB}`);
        }
    };
};

export default (
    dispatch: Dispatch,
    {
        detectingTraceDb,
        displayDetectingTraceDbMessage,
    }: {
        detectingTraceDb: boolean;
        displayDetectingTraceDbMessage: boolean;
    }
) => {
    const detectModemFwUuid = detectingTraceDb ? makeDetectModemFwUuid() : noop;
    const detectTraceDB = detectingTraceDb ? makeDetectTraceDB(dispatch) : noop;

    if (displayDetectingTraceDbMessage) {
        dispatch(setDetectingTraceDb(true));
    }

    let lastUpdate = Date.now();
    let pendingUpdate: NodeJS.Timeout;
    let lookingForDb = displayDetectingTraceDbMessage;

    const update = (progress: nrfml.Progress) => {
        try {
            progress?.data_offsets?.forEach(progressItem => {
                dispatch(
                    setTraceProgress({
                        path: progressItem.path,
                        size: progressItem.offset,
                    })
                );
            });
            lastUpdate = Date.now();
        } catch (err) {
            logger.debug(
                `Error in progress callback, discarding sample ${JSON.stringify(
                    err
                )}`
            );
        }
    };

    return (progress: nrfml.Progress) => {
        if (lookingForDb) {
            dispatch(setDetectingTraceDb(false));
        }
        lookingForDb = false;
        detectModemFwUuid(progress);
        detectTraceDB(progress);

        if (Date.now() - lastUpdate > 200) {
            update(progress);
        } else {
            clearTimeout(pendingUpdate);
            pendingUpdate = setTimeout(() => update(progress), 200);
        }
    };
};
