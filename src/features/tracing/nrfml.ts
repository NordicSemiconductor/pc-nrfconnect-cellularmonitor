/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, { getPluginsDir } from '@nordicsemiconductor/nrf-monitor-lib-js';
// eslint-disable-next-line import/no-unresolved
import { Sources } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import { logger, usageData } from 'pc-nrfconnect-shared';

import { RootState } from '../../reducers';
import { TAction } from '../../thunk';
import EventAction from '../../usageDataActions';
import {
    hasProgress,
    requiresTraceDb,
    sinkEvent,
    SourceFormat,
    TraceFormat,
} from './formats';
import sinkConfig from './sinkConfig';
import sinkFile from './sinkFile';
import sourceConfig from './sourceConfig';
import {
    getManualDbFilePath,
    getSerialPort,
    setDetectingTraceDb,
    setTraceIsStarted,
    setTraceIsStopped,
    setTraceProgress,
} from './traceSlice';

export type TaskId = number;

const traceConfig = ({
    state,
    source,
    sinks,
}: {
    state: RootState;
    source: SourceFormat;
    sinks: TraceFormat[];
}) => ({
    isDetectingTraceDb:
        getManualDbFilePath(state) == null && requiresTraceDb(sinks),

    nrfmlConfig: {
        config: { plugins_directory: getPluginsDir() },
        sources: [sourceConfig(state, source, sinks)] as Sources,
        sinks: sinks.map(format => sinkConfig(state, source, format)),
    },

    progressConfigs: sinks.filter(hasProgress).map(format => ({
        format,
        path: sinkFile(source, format),
    })),
});

function detectTraceDB(progress: nrfml.Progress, detectedTraceDB: unknown) {
    if (
        progress.meta?.modem_db_path != null &&
        detectedTraceDB !== progress.meta?.modem_db_path
    ) {
        detectedTraceDB = progress.meta?.modem_db_path;
        logger.info(`Using trace DB ${detectedTraceDB}`);
    }
    return detectedTraceDB;
}

function detectModemFwUuid(
    progress: nrfml.Progress,
    detectedModemFwUuid: unknown
) {
    if (
        progress.meta?.modem_db_uuid != null &&
        detectedModemFwUuid !== progress.meta?.modem_db_uuid
    ) {
        detectedModemFwUuid = progress.meta?.modem_db_uuid;
        logger.info(`Detected modem firmware with UUID ${detectedModemFwUuid}`);
    }
    return detectedModemFwUuid;
}

export const convertTraceFile =
    (path: string): TAction =>
    (dispatch, getState) => {
        let detectedModemFwUuid: unknown;
        let detectedTraceDB: unknown;
        usageData.sendUsageData(EventAction.CONVERT_TRACE);

        const config = traceConfig({
            state: getState(),
            source: { type: 'file', path },
            sinks: ['pcap'],
        });

        const taskId = nrfml.start(
            config.nrfmlConfig,
            err => {
                if (err?.error_code === 100) {
                    logger.error(
                        'Trace file does not include modem UUID, so trace database version cannot automatically be detected. Please select trace database manually from Advanced Options.'
                    );
                } else if (err != null) {
                    logger.error(`Failed conversion to pcap: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info(`Successfully converted ${path} to pcap`);
                }
                dispatch(setTraceIsStopped());
            },
            progress => {
                if (config.isDetectingTraceDb) {
                    detectedModemFwUuid = detectModemFwUuid(
                        progress,
                        detectedModemFwUuid
                    );

                    detectedTraceDB = detectTraceDB(progress, detectedTraceDB);
                }

                progress.data_offsets?.forEach(progressItem => {
                    dispatch(
                        setTraceProgress({
                            path: progressItem.path,
                            size: progressItem.offset,
                        })
                    );
                });
            }
        );
        dispatch(
            setTraceIsStarted({
                taskId,
                progressConfigs: config.progressConfigs,
            })
        );
    };

export const startTrace =
    (sinks: TraceFormat[]): TAction =>
    (dispatch, getState) => {
        const port = getSerialPort(getState());
        if (!port) {
            logger.error('Select serial port to start tracing');
            return;
        }
        sinks.forEach(format => {
            usageData.sendUsageData(sinkEvent(format));
        });

        const config = traceConfig({
            state: getState(),
            source: { type: 'device', port },
            sinks,
        });

        if (config.isDetectingTraceDb) {
            dispatch(setDetectingTraceDb(true));
        }

        let detectedModemFwUuid: unknown = '';
        let detectedTraceDB: unknown = '';
        let progressCallbackCounter = 0;

        const taskId = nrfml.start(
            config.nrfmlConfig,
            err => {
                if (err != null) {
                    logger.error(`Error when creating trace: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info('Finished tracefile');
                }
                // stop tracing if Completed callback is called and we are only doing live tracing
                if (sinks.length === 1 && sinks[0] === 'live') {
                    dispatch(stopTrace(taskId));
                }
            },
            progress => {
                if (
                    config.isDetectingTraceDb &&
                    !detectedModemFwUuid &&
                    !detectedTraceDB
                ) {
                    detectedModemFwUuid = detectModemFwUuid(
                        progress,
                        detectedModemFwUuid
                    );

                    detectedTraceDB = detectTraceDB(progress, detectedTraceDB);
                    dispatch(setDetectingTraceDb(false));
                }

                /*
                    This callback is triggered quite often, and it can negatively affect the
                    performance, so it should be fine to only process every nth sample. The offset
                    property received from nrfml is accumulated size, so we don't lose any data this way
                */
                progressCallbackCounter += 1;
                if (progressCallbackCounter % 30 !== 0) return;
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
            }
        );
        logger.info('Started tracefile');
        dispatch(
            setTraceIsStarted({
                taskId,
                progressConfigs: config.progressConfigs,
            })
        );
    };

export const stopTrace =
    (taskId: TaskId | null): TAction =>
    dispatch => {
        if (taskId === null) return;
        nrfml.stop(taskId);
        usageData.sendUsageData(EventAction.STOP_TRACE);
        dispatch(setTraceIsStopped());
    };
