/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
import { logger } from 'pc-nrfconnect-shared';
import { Dispatch } from 'redux';

import {
    setDetectingTraceDb,
    setManualDbFilePath,
    setTraceProgress,
} from './traceSlice';

type MetaField = nrfml.MetaFields[keyof nrfml.MetaFields];

const makeDetectTraceDB = (dispatch: Dispatch) => {
    let detectedTraceDB: MetaField;

    return (progress: nrfml.Progress) => {
        const reportedTraceDB = progress.meta?.modem_db_path as string;

        if (
            detectedTraceDB == null &&
            reportedTraceDB !== '' &&
            detectedTraceDB !== reportedTraceDB
        ) {
            logger.info(`Detected trace DB: ${reportedTraceDB}`);
            dispatch(setManualDbFilePath(reportedTraceDB as string));
            return reportedTraceDB;
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
    const detectTraceDB = detectingTraceDb ? makeDetectTraceDB(dispatch) : null;

    if (displayDetectingTraceDbMessage) {
        dispatch(setDetectingTraceDb(true));
    }

    let traceDB: string | undefined;
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
        if (traceDB == null && detectTraceDB != null) {
            traceDB = detectTraceDB(progress);

            if (traceDB != null) {
                // Stop looking for trace DB
                if (lookingForDb) {
                    dispatch(setDetectingTraceDb(false));
                    lookingForDb = false;
                }
            }
        }

        if (Date.now() - lastUpdate > 200) {
            update(progress);
        } else {
            clearTimeout(pendingUpdate);
            pendingUpdate = setTimeout(() => update(progress), 200);
        }
    };
};
