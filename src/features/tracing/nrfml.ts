/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, { getPluginsDir } from '@nordicsemiconductor/nrf-monitor-lib-js';
import path from 'path';
import { getAppDataDir, logger } from 'pc-nrfconnect-shared';

import { selectedDevice } from '../../shouldBeInShared';
import { TAction } from '../../thunk';
import {
    fileExtension,
    requiresTraceDb,
    sinkConfig,
    TraceFormat,
} from './sinks';
import { detectModemFwUuid, detectTraceDB, sourceConfig } from './sources';
import {
    getManualDbFilePath,
    getSerialPort,
    getWiresharkPath,
    setDetectingTraceDb,
    setTaskId,
    setTraceData,
    TraceData,
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

        const traceData: TraceData = {
            format: traceFormat,
            size: 0,
            path: destinationPath,
        };
        let detectedModemFwUuid: unknown;
        let detectedTraceDB: unknown;

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
                if (err != null) {
                    logger.error(`Failed conversion to pcap: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info(`Successfully converted ${basename} to pcap`);
                }
                dispatch(setTaskId(null));
            },
            progress => {
                if (!manualDbFilePath) {
                    detectedModemFwUuid = detectModemFwUuid(
                        progress,
                        detectedModemFwUuid
                    );

                    detectedTraceDB = detectTraceDB(progress, detectedTraceDB);
                }

                progress.data_offsets
                    ?.filter(
                        ({ path: progressPath }) =>
                            progressPath === destinationPath
                    )
                    .forEach(({ offset }) => {
                        dispatch(
                            setTraceData([{ ...traceData, size: offset }])
                        );
                    });
            }
        );
        dispatch(setTraceData([traceData]));
        dispatch(setTaskId(taskId));
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
        const traceData: TraceData[] = [];
        let wiresharkPath: string | null;
        let filePath = '';
        const sinkConfigs = traceFormats.map(format => {
            if (format === 'live') {
                wiresharkPath = getWiresharkPath(getState());
            } else {
                filePath =
                    path.join(getAppDataDir(), filename) +
                    fileExtension(format);
            }

            traceData.push({
                format,
                path: filePath,
                size: 0,
            });
            return sinkConfig[format](filePath, device, wiresharkPath);
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
                    const newTraceData = traceData.map(trace => {
                        if (!progress.data_offsets) return trace;
                        const index = progress.data_offsets.findIndex(
                            data => trace.path === data.path
                        );
                        const dataOffset = progress.data_offsets[index];
                        return {
                            ...trace,
                            size: dataOffset ? dataOffset.offset : trace.size,
                        };
                    });
                    dispatch(setTraceData(newTraceData));
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
        dispatch(setTraceData(traceData));
        dispatch(setTaskId(taskId));
    };

const stopTrace =
    (taskId: TaskId | null): TAction =>
    dispatch => {
        if (taskId === null) return;
        nrfml.stop(taskId);
        dispatch(setTaskId(null));
    };

export { convertTraceFile, startTrace, stopTrace };
