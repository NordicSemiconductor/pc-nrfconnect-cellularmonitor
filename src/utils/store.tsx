/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getPluginsDir } from '@nordicsemiconductor/nrf-monitor-lib-js';
import path from 'path';
import { getPersistentStore as store } from 'pc-nrfconnect-shared';

import {
    ALL_TRACE_FORMATS,
    TraceFormat,
} from '../features/tracing/traceFormat';

interface DevicePort {
    [serialNumber: string]: string;
}

const MANUAL_DB_FILE_PATH_KEY = 'dbFilePath';
const WIRESHARK_EXECUTABLE_PATH_KEY = 'wiresharkExecutablePath';
const TRACE_FORMATS = 'traceFormats';
const SERIALPORTS = 'serialPorts';
const HIDE_NRF_CMD_LINE_ALERT = 'hideNrfCmdLineAlert';

interface StoreSchema {
    [MANUAL_DB_FILE_PATH_KEY]: string;
    [WIRESHARK_EXECUTABLE_PATH_KEY]: string | null;
    [TRACE_FORMATS]: TraceFormat[];
    [SERIALPORTS]: DevicePort;
    [HIDE_NRF_CMD_LINE_ALERT]: boolean;
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

export const getManualDbFilePath = () =>
    store<StoreSchema>().get(MANUAL_DB_FILE_PATH_KEY);
export const setManualDbFilePath = (manualDbFilePath: string) =>
    store<StoreSchema>().set(MANUAL_DB_FILE_PATH_KEY, manualDbFilePath);
export const deleteDbFilePath = () =>
    store<StoreSchema>().delete(MANUAL_DB_FILE_PATH_KEY);

export const getWiresharkPath = () =>
    store<StoreSchema>().get(WIRESHARK_EXECUTABLE_PATH_KEY, null);
export const setWiresharkPath = (wiresharkPath: string) =>
    store<StoreSchema>().set(WIRESHARK_EXECUTABLE_PATH_KEY, wiresharkPath);

export const getTraceFormats = () =>
    store<StoreSchema>().get(TRACE_FORMATS, [ALL_TRACE_FORMATS[0]]);
export const setTraceFormats = (traceFormats: TraceFormat[]) =>
    store<StoreSchema>().set(TRACE_FORMATS, traceFormats);

const serialPorts = () => store<StoreSchema>().get(SERIALPORTS, {});
export const getSerialPort = (serialNumber: string) => {
    return serialPorts()[serialNumber];
};
export const setSerialPort = (serialNumber: string, port: string) =>
    store<StoreSchema>().set(SERIALPORTS, {
        ...serialPorts(),
        [serialNumber]: port,
    });

export const getHideNrfCommandLineAlert = () =>
    store<StoreSchema>().get(HIDE_NRF_CMD_LINE_ALERT, false);
export const persistHideNrfCommandLineAlert = () =>
    store<StoreSchema>().set(HIDE_NRF_CMD_LINE_ALERT, true);
