/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import { getAppFile, getPersistentStore } from 'pc-nrfconnect-shared';

import { ALL_TRACE_FORMATS, TraceFormat } from '../features/tracing/formats';

interface DevicePort {
    [serialNumber: string]: string;
}

const MANUAL_DB_FILE_PATH_KEY = 'dbFilePath';
const WIRESHARK_EXECUTABLE_PATH_KEY = 'wiresharkExecutablePath';
const TSHARK_EXECUTABLE_PATH_KEY = 'tsharkExecutablePath';
const TRACE_FORMATS = 'traceFormats';
const SERIALPORTS = 'serialPorts';
const COLLAPSE_TRACE_DETAILS_SECTION = 'collapseTraceDetailsSection';
const COLLAPSE_POWER_SECTION = 'collapsePowerSection';
const COLLAPSE_CONNECTION_STATUS_SECTION = 'connectionStatusSection';
const SHOW_STARTUP_DIALOG = 'showStartupDialog';

const store = getPersistentStore<StoreSchema>({
    migrations: {
        '0.4.5': instance => {
            instance.set(TRACE_FORMATS, ['raw', 'tshark']);
        },
    },
});

interface StoreSchema {
    [MANUAL_DB_FILE_PATH_KEY]: string | undefined;
    [WIRESHARK_EXECUTABLE_PATH_KEY]: string | null;
    [TSHARK_EXECUTABLE_PATH_KEY]: string | null;
    [TRACE_FORMATS]: TraceFormat[];
    [SERIALPORTS]: DevicePort;
    [COLLAPSE_POWER_SECTION]: boolean;
    [COLLAPSE_TRACE_DETAILS_SECTION]: boolean;
    [COLLAPSE_CONNECTION_STATUS_SECTION]: boolean;
}

export const autoDetectDbRootFolder = () =>
    getAppFile(path.join('resources', 'traceDB')) as string;

export const getManualDbFilePath = () => store.get(MANUAL_DB_FILE_PATH_KEY);
export const setManualDbFilePath = (manualDbFilePath: string) =>
    store.set(MANUAL_DB_FILE_PATH_KEY, manualDbFilePath);
export const deleteDbFilePath = () => store.delete(MANUAL_DB_FILE_PATH_KEY);

export const getWiresharkPath = () =>
    store.get(WIRESHARK_EXECUTABLE_PATH_KEY, null);
export const setWiresharkPath = (wiresharkPath: string) =>
    store.set(WIRESHARK_EXECUTABLE_PATH_KEY, wiresharkPath);

export const getTsharkPath = () => store.get(TSHARK_EXECUTABLE_PATH_KEY, null);
export const setTsharkPath = (tsharkPath: string) =>
    store.set(TSHARK_EXECUTABLE_PATH_KEY, tsharkPath);

export const getTraceFormats = () =>
    store.get(TRACE_FORMATS, [ALL_TRACE_FORMATS[0]]);
export const setTraceFormats = (traceFormats: TraceFormat[]) =>
    store.set(TRACE_FORMATS, traceFormats);

const serialPorts = () => store.get(SERIALPORTS, {});
export const getSerialPort = (serialNumber: string) =>
    serialPorts()[serialNumber];

export const setSerialPort = (serialNumber: string, port: string) =>
    store.set(SERIALPORTS, {
        ...serialPorts(),
        [serialNumber]: port,
    });

export const getCollapsePowerSection = () =>
    store.get(COLLAPSE_POWER_SECTION, false);
export const setCollapsePowerSection = (collapsePowerSection: boolean) =>
    store.set(COLLAPSE_POWER_SECTION, collapsePowerSection);

export const getCollapseConnectionStatusSection = () =>
    store.get(COLLAPSE_CONNECTION_STATUS_SECTION, false);
export const setCollapseConnectionStatusSection = (
    collapseConnectionStatusSection: boolean
) =>
    store.set(
        COLLAPSE_CONNECTION_STATUS_SECTION,
        collapseConnectionStatusSection
    );

export const setShowStartupDialog = (showStartupDialog: boolean) =>
    store.set(SHOW_STARTUP_DIALOG, showStartupDialog);
export const getShowStartupDialog = () => store.get(SHOW_STARTUP_DIALOG, true);
