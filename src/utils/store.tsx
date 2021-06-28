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

import { getPluginsDir } from 'nrf-monitor-lib-js';
import path from 'path';
import { getPersistentStore as store } from 'pc-nrfconnect-shared';

import { TRACE_FORMATS, TraceFormat } from '../nrfml/traceFormat';

interface DevicePort {
    [serialNumber: string]: string;
}

const DB_FILE_PATH_KEY = 'dbFilePath';
const WIRESHARK_EXECUTABLE_PATH_KEY = 'wiresharkExecutablePath';
const TRACE_FORMAT = 'sinkType';
const SERIALPORTS = 'serialPorts';

interface StoreSchema {
    [DB_FILE_PATH_KEY]: string;
    [WIRESHARK_EXECUTABLE_PATH_KEY]: string | null;
    [TRACE_FORMAT]: TraceFormat;
    [SERIALPORTS]: DevicePort;
}

const AUTO_DETECT_DB_ROOT_RELATIVE_TO_PLUGINS_DIR = [
    '..',
    '..',
    'config',
    'auto-detect-trace-db-config',
];

export const autoDetectDbRootFolder = path.join(
    getPluginsDir(),
    ...AUTO_DETECT_DB_ROOT_RELATIVE_TO_PLUGINS_DIR,
    path.sep
);

const DEFAULT_DB_FILE_PATH = path.join(
    autoDetectDbRootFolder,
    'mfw_nrf9160_1.3.0_trace-db.json'
);

export const isDefaultDbFilePath = (dbFilePath: string) =>
    dbFilePath === DEFAULT_DB_FILE_PATH;

export const getDbFilePath = () =>
    store<StoreSchema>().get(DB_FILE_PATH_KEY, DEFAULT_DB_FILE_PATH);
export const setDbFilePath = (dbFilePath: string) =>
    store<StoreSchema>().set(DB_FILE_PATH_KEY, dbFilePath);
export const deleteDbFilePath = () =>
    store<StoreSchema>().delete(DB_FILE_PATH_KEY);

export const getWiresharkPath = () =>
    store<StoreSchema>().get(WIRESHARK_EXECUTABLE_PATH_KEY, null);
export const setWiresharkPath = (wiresharkPath: string) =>
    store<StoreSchema>().set(WIRESHARK_EXECUTABLE_PATH_KEY, wiresharkPath);

export const getTraceFormat = () =>
    store<StoreSchema>().get(TRACE_FORMAT, TRACE_FORMATS[0]);
export const setTraceFormat = (traceFormat: TraceFormat) =>
    store<StoreSchema>().set(TRACE_FORMAT, traceFormat);

const serialPorts = () => store<StoreSchema>().get(SERIALPORTS, {});
export const getSerialPort = (serialNumber: string) => {
    return serialPorts()[serialNumber];
};

export const setSerialPort = (serialNumber: string, port: string) =>
    store<StoreSchema>().set(SERIALPORTS, {
        ...serialPorts(),
        [serialNumber]: port,
    });
