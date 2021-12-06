/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, { getPluginsDir } from '@nordicsemiconductor/nrf-monitor-lib-js';
import path from 'path';
import { getAppDataDir, logger, usageData } from 'pc-nrfconnect-shared';

import { selectedDevice } from '../../shouldBeInShared';
import { TAction } from '../../thunk';
import EventAction from '../../usageDataActions';
import {
    fileExtension,
    requiresTraceDb,
    sinkConfig,
    sinkEvent,
    TraceFormat,
} from './sinks';
import { detectModemFwUuid, detectTraceDB, sourceConfig } from './sources';
import {
    getManualDbFilePath,
    getSerialPort,
    getWiresharkPath,
    setDetectingTraceDb,
    setTraceIsStarted,
    setTraceIsStopped,
    setTraceProgress,
} from './traceSlice';

export type TaskId = number;

const convertTraceFile =
    (sourcePath: string): TAction =>
    (dispatch, getState) => {
        const traceFormat: TraceFormat = 'pcap';
        const basename = path.basename(sourcePath, '.bin');
        const directory = path.dirname(sourcePath);
        const destinationPath =
            path.join(directory, basename) + fileExtension(traceFormat);
        const manualDbFilePath = getManualDbFilePath(getState());

        let detectedModemFwUuid: unknown;
        let detectedTraceDB: unknown;
        usageData.sendUsageData(EventAction.CONVERT_TRACE);

        const taskId = nrfml.start(
            {
                config: { plugins_directory: getPluginsDir() },
                sinks: [sinkConfig[traceFormat](destinationPath)],
                sources: [
                    sourceConfig(manualDbFilePath, true, {
                        file_path: sourcePath,
                    }),
                ],
            },
            err => {
                if (err?.error_code === 100) {
                    logger.error(
                        'Trace file does not include modem UUID, so trace database version cannot automatically be detected. Please select trace database manually from Advanced Options.'
                    );
                } else if (err != null) {
                    logger.error(`Failed conversion to pcap: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info(`Successfully converted ${basename} to pcap`);
                }
                dispatch(setTraceIsStopped());
            },
            progress => {
                if (!manualDbFilePath) {
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
                progressConfigs: [
                    {
                        format: traceFormat,
                        path: destinationPath,
                    },
                ],
            })
        );
    };

const startTrace =
    (traceFormats: TraceFormat[]): TAction =>
    (dispatch, getState) => {
        const serialPort = getSerialPort(getState());
        if (!serialPort) {
            logger.error('Select serial port to start tracing');
            return;
        }
        const device = selectedDevice(getState());
        const filename = `trace-${new Date().toISOString().replace(/:/g, '-')}`;
        const extensionlessFilePath = path.join(getAppDataDir(), filename);
        const sinkConfigs = traceFormats.map(format => {
            let wiresharkPath: string | null = null;
            let filePath = '';
            if (format === 'live') {
                wiresharkPath = getWiresharkPath(getState());
            } else {
                filePath = extensionlessFilePath + fileExtension(format);
            }

            return sinkConfig[format](filePath, device, wiresharkPath);
        });
        const progressConfigs = traceFormats.map(format => {
            let filePath = '';
            if (format !== 'live') {
                filePath = extensionlessFilePath + fileExtension(format);
            }

            return {
                format,
                path: filePath,
            };
        });
        traceFormats.forEach(format => {
            usageData.sendUsageData(sinkEvent(format));
        });

        const manualDbFilePath = getManualDbFilePath(getState());

        if (!manualDbFilePath && requiresTraceDb(traceFormats)) {
            dispatch(setDetectingTraceDb(true));
        }

        let detectedModemFwUuid: unknown = '';
        let detectedTraceDB: unknown = '';
        let progressCallbackCounter = 0;

        const taskId = nrfml.start(
            {
                config: { plugins_directory: getPluginsDir() },
                sinks: sinkConfigs,
                sources: [
                    sourceConfig(
                        manualDbFilePath,
                        requiresTraceDb(traceFormats),
                        {
                            serialport: { path: serialPort },
                        }
                    ),
                ],
            },
            err => {
                if (err != null) {
                    logger.error(`Error when creating trace: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info('Finished tracefile');
                }
                // stop tracing if Completed callback is called and we are only doing live tracing
                if (traceFormats.length === 1 && traceFormats[0] === 'live') {
                    dispatch(stopTrace(taskId));
                }
            },
            progress => {
                if (
                    !manualDbFilePath &&
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
                progressConfigs,
            })
        );
    };

const stopTrace =
    (taskId: TaskId | null): TAction =>
    dispatch => {
        if (taskId === null) return;
        nrfml.stop(taskId);
        usageData.sendUsageData(EventAction.STOP_TRACE);
        dispatch(setTraceIsStopped());
    };

export { convertTraceFile, startTrace, stopTrace };
