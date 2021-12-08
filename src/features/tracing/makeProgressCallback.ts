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
        throttleUpdatingProgress,
    }: {
        detectingTraceDb: boolean;
        displayDetectingTraceDbMessage: boolean;
        throttleUpdatingProgress: boolean;
    }
) => {
    let progressCallbackCounter = 0;

    const detectModemFwUuid = detectingTraceDb ? makeDetectModemFwUuid() : noop;
    const detectTraceDB = detectingTraceDb ? makeDetectTraceDB() : noop;

    if (displayDetectingTraceDbMessage) {
        dispatch(setDetectingTraceDb(true));
    }

    return (progress: nrfml.Progress) => {
        if (displayDetectingTraceDbMessage && progressCallbackCounter === 0) {
            dispatch(setDetectingTraceDb(false));
        }

        detectModemFwUuid(progress);
        detectTraceDB(progress);

        /*
            This callback is triggered quite often, and it can negatively affect the
            performance, so it should be fine to only process every nth sample. The offset
            property received from nrfml is accumulated size, so we don't lose any data this way
        */
        progressCallbackCounter += 1;
        if (progressCallbackCounter % 30 !== 0 && throttleUpdatingProgress)
            return;
        try {
            progress?.data_offsets?.forEach(progressItem => {
                dispatch(
                    setTraceProgress({
                        path: progressItem.path,
                        size: progressItem.offset,
                    })
                );
            });
        } catch (err) {
            logger.debug(
                `Error in progress callback, discarding sample ${JSON.stringify(
                    err
                )}`
            );
        }
    };
};
