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
import { getAppDataDir, logger } from 'pc-nrfconnect-shared';

import { setNrfmlTaskId, setTracePath, setTraceSize } from '../actions';
import { getDbFilePath, getSerialPort } from '../reducer';
import { TAction } from '../thunk';
import { getSinkConfig, pcapSinkConfig, Sink } from './sinks';

export type TaskId = number;

const BUFFER_SIZE = 1;
const CHUNK_SIZE = 256;

const sourceConfig = (
    dbFilePath: string,
    additionalInitParameters: Partial<InsightInitParameters['init_parameters']>
) =>
    ({
        name: 'nrfml-insight-source',
        init_parameters: {
            ...additionalInitParameters,
            db_file_path: dbFilePath,
            chunk_size: CHUNK_SIZE,
        },
        config: {
            buffer_size: BUFFER_SIZE,
        },
    } as const);

const convertTraceFile = (tracePath: string): TAction => (
    dispatch,
    getState
) => {
    dispatch(setTraceSize(0));
    const filename = path.basename(tracePath, '.bin');
    const filepath = path.dirname(tracePath);
    const dbFilePath = getDbFilePath(getState());
    const taskId = nrfml.start(
        {
            config: {
                plugins_directory: getPluginsDir(),
            },
            sinks: [pcapSinkConfig(path.join(filepath, filename))],
            sources: [sourceConfig(dbFilePath, { file_path: tracePath })],
        },
        err => {
            if (err != null) {
                logger.error(`Failed conversion to pcap: ${err.message}`);
                logger.debug(`Full error: ${JSON.stringify(err)}`);
            } else {
                logger.info(`Successfully converted ${filename} to pcap`);
            }
        },
        progress => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- The type definition in nrf-monitor-lib-js is wrong in 0.5.1, so we need to manually override this. This is addressed in https://github.com/NordicPlayground/nrf-monitor-lib-js/pull/13 and this typecast can be removed when that fix is released
            const progressSize = (progress as any).data_offsets?.pcapng;
            if (progressSize != null) {
                dispatch(setTraceSize(progressSize));
            }
        }
    );
    dispatch(setNrfmlTaskId(taskId));
};

const startTrace = (sink: Sink): TAction => (dispatch, getState) => {
    const serialPort = getSerialPort(getState());
    if (!serialPort) {
        logger.error('Select serial port to start tracing');
        return;
    }
    dispatch(setTraceSize(0));
    const filename = `trace-${new Date().toISOString().replace(/:/g, '-')}`;
    const filepath = path.join(getAppDataDir(), filename);
    const dbFilePath = getDbFilePath(getState());
    const sinkConfig = getSinkConfig(sink, filepath);
    const taskId = nrfml.start(
        {
            config: {
                plugins_directory: getPluginsDir(),
            },
            sinks: [sinkConfig],
            sources: [
                sourceConfig(dbFilePath, { serialport: { path: serialPort } }),
            ],
        },
        err => {
            if (err != null) {
                logger.error(
                    `Error when creating trace. Make sure selected serialport is not in use by another program: ${err.message}`
                );
                logger.debug(`Full error: ${JSON.stringify(err)}`);
            } else {
                logger.info('Finished tracefile');
            }
        },
        progress => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- The type definition in nrf-monitor-lib-js is wrong in 0.5.1, so we need to manually override this. This is addressed in https://github.com/NordicPlayground/nrf-monitor-lib-js/pull/13 and this typecast can be removed when that fix is released
            const traceSizes = (progress as any).data_offsets;

            const traceSize =
                sink === 'raw' ? traceSizes?.RAW_DATA : traceSizes?.pcapng;
            if (traceSize != null) {
                dispatch(setTraceSize(traceSize));
            }
        }
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tracePath = sinkConfig.init_parameters.file_path!;
    logger.info(`Started tracefile: ${tracePath}`);

    dispatch(setTracePath(tracePath));
    dispatch(setNrfmlTaskId(taskId));
};

const stopTrace = (taskId: TaskId | null): TAction => dispatch => {
    if (taskId === null) return;
    nrfml.stop(taskId);
    dispatch(setNrfmlTaskId(null));
};

export { convertTraceFile, startTrace, stopTrace };
