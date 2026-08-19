/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ProgressDocument } from '@nordicsemi/nrfml-js';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { type Dispatch } from 'redux';

import {
    setDetectingTraceDb,
    setManualDbFilePath,
    setTraceProgress,
} from './traceSlice';

const makeDetectTraceDB = (dispatch: Dispatch) => {
    let detectedTraceDB;

    return (progress: ProgressDocument) => {
        const reportedTraceDB = progress.meta.modemDbMetadata?.path as string;

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
    },
) => {
    const detectTraceDB = detectingTraceDb ? makeDetectTraceDB(dispatch) : null;

    if (displayDetectingTraceDbMessage) {
        dispatch(setDetectingTraceDb(true));
    }

    let traceDB: string | undefined;
    let lastUpdate = Date.now();
    let pendingUpdate: NodeJS.Timeout;
    let lookingForDb = displayDetectingTraceDbMessage;

    const update = (progress: ProgressDocument) => {
        try {
            progress.sinkInfos.forEach(([_, { path, offset }]) => {
                dispatch(
                    setTraceProgress({
                        path,
                        size: Number(offset),
                    }),
                );
            });
            lastUpdate = Date.now();
        } catch (err) {
            logger.debug(
                `Error in progress callback, discarding sample ${JSON.stringify(
                    err,
                )}`,
            );
        }
    };

    return (progress: ProgressDocument) => {
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
