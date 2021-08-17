/* Copyright (c) 2015 - 2021, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import nrfml, { getPluginsDir } from 'nrf-monitor-lib-js';
// eslint-disable-next-line import/no-unresolved -- Because this is a pure typescript type import which eslint does not understand correctly yet. This can be removed either when we start to use eslint-import-resolver-typescript in shared of expose this type in a better way from nrf-monitor-lib-js
import { InsightInitParameters } from 'nrf-monitor-lib-js/config/configuration';
import path from 'path';
import { Device, getAppDataDir, logger } from 'pc-nrfconnect-shared';
import { pathToFileURL } from 'url';

import { deviceInfo, selectedDevice } from '../../shouldBeInShared';
import { TAction } from '../../thunk';
import { autoDetectDbRootFolder } from '../../utils/store';
import { fileExtension, sinkName, TraceFormat } from './traceFormat';
import {
    getManualDbFilePath,
    getSerialPort,
    setTaskId,
    setTracePath,
    setTraceSize,
} from './traceSlice';

const { displayName: appName } = require('../../../package.json');

export type TaskId = number;
const BUFFER_SIZE = 1;
const CHUNK_SIZE = 256;

const autoDetectDbCacheDirectory = path.join(getAppDataDir(), 'trace_db_cache');

const autoDetectDbRootURL = pathToFileURL(autoDetectDbRootFolder).toString();

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

const additionalPcapProperties = (format: TraceFormat, device?: Device) => {
    if (format === 'raw') return {};

    return {
        os_name: process.platform,
        application_name: appName,
        hw_name: device != null ? describeDevice(device) : undefined,
    };
};

const sinkConfig = (format: TraceFormat, filePath: string, device?: Device) =>
    ({
        name: sinkName(format),
        init_parameters: {
            file_path: filePath,
            ...additionalPcapProperties(format, device),
        },
    } as const);

const convertTraceFile =
    (sourcePath: string): TAction =>
    (dispatch, getState) => {
        dispatch(setTraceSize(0));
        const destinationFormat = 'pcap';
        const basename = path.basename(sourcePath, '.bin');
        const directory = path.dirname(sourcePath);
        const destinationPath =
            path.join(directory, basename) + fileExtension(destinationFormat);
        const manualDbFilePath = getManualDbFilePath(getState());

        let detectedModemFwUuid: unknown;
        let detectedTraceDB: unknown;

        const taskId = nrfml.start(
            {
                config: { plugins_directory: getPluginsDir() },
                sinks: [sinkConfig(destinationFormat, destinationPath)],
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
            },
            progress => {
                if (
                    progress.meta?.modem_db_uuid != null &&
                    detectedModemFwUuid !== progress.meta?.modem_db_uuid
                ) {
                    detectedModemFwUuid = progress.meta?.modem_db_uuid;
                    logger.info(
                        `Detected modem firmware with UUID ${detectedModemFwUuid}`
                    );
                }

                if (
                    progress.meta?.modem_db_path != null &&
                    detectedTraceDB !== progress.meta?.modem_db_path
                ) {
                    detectedTraceDB = progress.meta?.modem_db_path;
                    logger.info(`Using trace DB ${detectedTraceDB}`);
                }

                progress.data_offsets
                    ?.filter(
                        ({ path: progressPath }) =>
                            progressPath === destinationPath
                    )
                    .forEach(({ offset }) => {
                        dispatch(setTraceSize(offset));
                    });
            }
        );
        dispatch(setTaskId(taskId));
        dispatch(setTracePath(destinationPath));
    };

const startTrace =
    (traceFormat: TraceFormat): TAction =>
    (dispatch, getState) => {
        const serialPort = getSerialPort(getState());
        if (!serialPort) {
            logger.error('Select serial port to start tracing');
            return;
        }
        dispatch(setTraceSize(0));
        const filename = `trace-${new Date().toISOString().replace(/:/g, '-')}`;
        const filePath =
            path.join(getAppDataDir(), filename) + fileExtension(traceFormat);
        const manualDbFilePath = getManualDbFilePath(getState());

        let detectedModemFwUuid: unknown = '';
        let detectedTraceDB: unknown = '';

        const taskId = nrfml.start(
            {
                config: { plugins_directory: getPluginsDir() },
                sinks: [
                    sinkConfig(
                        traceFormat,
                        filePath,
                        selectedDevice(getState())
                    ),
                ],
                sources: [
                    sourceConfig(manualDbFilePath, traceFormat === 'pcap', {
                        serialport: { path: serialPort },
                    }),
                ],
            },
            err => {
                if (err != null) {
                    logger.error(`Error when creating trace: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info('Finished tracefile');
                }
            },
            progress => {
                if (
                    progress.meta?.modem_db_uuid != null &&
                    detectedModemFwUuid !== progress.meta?.modem_db_uuid
                ) {
                    detectedModemFwUuid = progress.meta?.modem_db_uuid;
                    logger.info(
                        `Detected modem firmware with UUID ${detectedModemFwUuid}`
                    );
                }

                if (
                    progress.meta?.modem_db_path != null &&
                    detectedTraceDB !== progress.meta?.modem_db_path
                ) {
                    detectedTraceDB = progress.meta?.modem_db_path;
                    logger.info(`Using trace DB ${detectedTraceDB}`);
                }

                progress.data_offsets
                    ?.filter(
                        ({ path: progressPath }) => progressPath === filePath
                    )
                    .forEach(({ offset }) => {
                        dispatch(setTraceSize(offset));
                    });
            }
        );
        logger.info(`Started tracefile: ${filePath}`);

        dispatch(setTracePath(filePath));
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
