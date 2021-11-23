/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, { getPluginsDir } from '@nordicsemiconductor/nrf-monitor-lib-js';
// eslint-disable-next-line import/no-unresolved -- Because this is a pure typescript type import which eslint does not understand correctly yet. This can be removed either when we start to use eslint-import-resolver-typescript in shared of expose this type in a better way from nrf-monitor-lib-js
import { InsightInitParameters } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import path from 'path';
import { Device, getAppDataDir, logger } from 'pc-nrfconnect-shared';
import { pathToFileURL } from 'url';

import { deviceInfo, selectedDevice } from '../../shouldBeInShared';
import { TAction } from '../../thunk';
import { autoDetectDbRootFolder } from '../../utils/store';
import { defaultWiresharkPath } from '../../utils/wireshark';
import { fileExtension, TraceFormat } from './traceFormat';
import {
    getManualDbFilePath,
    getSerialPort,
    setDetectingTraceDb,
    setTaskId,
    setTraceData,
    TraceData,
} from './traceSlice';

const { displayName: appName } = require('../../../package.json');

export type TaskId = number;
const BUFFER_SIZE = 1;
const CHUNK_SIZE = 256;

const autoDetectDbCacheDirectory = path.join(getAppDataDir(), 'trace_db_cache');

const autoDetectDbRootURL = pathToFileURL(autoDetectDbRootFolder).toString();

const requiresTraceDb = (formats: TraceFormat[]) =>
    formats.includes('pcap') || formats.includes('live');

const sourceConfig = (
    manualDbFilePath: string | undefined,
    useTraceDB: boolean,
    additionalInitParameters: Partial<InsightInitParameters['init_parameters']>
) => {
    const initParameterForTraceDb =
        manualDbFilePath != null
            ? { db_file_path: manualDbFilePath }
            : {
                  auto_detect_db_config: {
                      cache_directory: autoDetectDbCacheDirectory,
                      root: autoDetectDbRootURL,
                      update_cache: true,
                      // eslint-disable-next-line no-template-curly-in-string -- Because this is no template string but the syntax used by nrf-monitor-lib
                      trace_db_locations: ['${root}/config.json'] as unknown[],
                  },
              };

    return {
        name: 'nrfml-insight-source',
        init_parameters: {
            ...additionalInitParameters,
            ...(useTraceDB ? initParameterForTraceDb : {}),
            chunk_size: CHUNK_SIZE,
        },
        config: {
            buffer_size: BUFFER_SIZE,
        },
    } as const;
};

const describeDevice = (device: Device) =>
    `${deviceInfo(device).name ?? 'unknown'} ${device?.boardVersion}`;

const additionalPcapProperties = (device?: Device) => ({
    os_name: process.platform,
    application_name: appName,
    hw_name: device != null ? describeDevice(device) : undefined,
});

export const sinkConfig = {
    raw: (filePath: string) =>
        ({
            name: 'nrfml-raw-file-sink',
            init_parameters: {
                file_path: filePath,
            },
        } as const),
    pcap: (filePath: string, device?: Device) =>
        ({
            name: 'nrfml-pcap-sink',
            init_parameters: {
                file_path: filePath,
                ...additionalPcapProperties(device),
            },
        } as const),
    live: (filePath: string, device?: Device) =>
        ({
            name: 'nrfml-wireshark-named-pipe-sink',
            init_parameters: {
                start_process: `"${defaultWiresharkPath()}"`,
                ...additionalPcapProperties(device),
            },
        } as const),
};

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
        const sinkConfigs = traceFormats.map(format => {
            const filePath =
                format !== 'live'
                    ? path.join(getAppDataDir(), filename) +
                      fileExtension(format)
                    : '';
            traceData.push({
                format,
                path: filePath,
                size: 0,
            });
            return sinkConfig[format](filePath, device);
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
