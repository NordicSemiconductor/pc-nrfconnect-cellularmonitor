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

import { setDetectingTraceDb, setTraceProgress } from './traceSlice';

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

const makeDetectTraceDB = () => {
    let detectedTraceDB: MetaField;

    return (progress: nrfml.Progress) => {
        const reportedTraceDB = progress.meta?.modem_db_path;

        if (detectedTraceDB == null && detectedTraceDB !== reportedTraceDB) {
            detectedTraceDB = reportedTraceDB;
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
    let progressCallbackCounter = 0;

    const detectModemFwUuid = detectingTraceDb ? makeDetectModemFwUuid() : noop;
    const detectTraceDB = detectingTraceDb ? makeDetectTraceDB() : noop;

    if (displayDetectingTraceDbMessage) {
        dispatch(setDetectingTraceDb(true));
    }

    let latestProgress: nrfml.Progress | null = null;
    let lastUpdate = Date.now();
    let pendingUpdate: NodeJS.Timeout;

    const update = () => {
        try {
            latestProgress?.data_offsets?.forEach(progressItem => {
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
        if (displayDetectingTraceDbMessage && progressCallbackCounter === 0) {
            dispatch(setDetectingTraceDb(false));
        }
        detectModemFwUuid(progress);
        detectTraceDB(progress);

        latestProgress = progress;

        if (Date.now() - lastUpdate > 200) {
            update();
        } else {
            clearTimeout(pendingUpdate);
            pendingUpdate = setTimeout(update, 200);
        }

        progressCallbackCounter += 1;
    };
};
