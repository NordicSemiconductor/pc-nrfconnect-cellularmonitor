/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import { getAppFile, getPersistentStore as store } from 'pc-nrfconnect-shared';

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

interface StoreSchema {
    [MANUAL_DB_FILE_PATH_KEY]: string | undefined;
    [WIRESHARK_EXECUTABLE_PATH_KEY]: string | null;
    [TSHARK_EXECUTABLE_PATH_KEY]: string | null;
    [TRACE_FORMATS]: TraceFormat[];
    [SERIALPORTS]: DevicePort;
    [COLLAPSE_POWER_SECTION]: boolean;
    [COLLAPSE_TRACE_DETAILS_SECTION]: boolean;
}

export const autoDetectDbRootFolder = getAppFile(
    path.join('resources', 'traceDB')
) as string;

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

export const getTsharkPath = () =>
    store<StoreSchema>().get(TSHARK_EXECUTABLE_PATH_KEY, null);
export const setTsharkPath = (tsharkPath: string) =>
    store<StoreSchema>().set(TSHARK_EXECUTABLE_PATH_KEY, tsharkPath);

export const getTraceFormats = () =>
    store<StoreSchema>().get(TRACE_FORMATS, [ALL_TRACE_FORMATS[0]]);
export const setTraceFormats = (traceFormats: TraceFormat[]) =>
    store<StoreSchema>().set(TRACE_FORMATS, traceFormats);

const serialPorts = () => store<StoreSchema>().get(SERIALPORTS, {});
export const getSerialPort = (serialNumber: string) =>
    serialPorts()[serialNumber];

export const setSerialPort = (serialNumber: string, port: string) =>
    store<StoreSchema>().set(SERIALPORTS, {
        ...serialPorts(),
        [serialNumber]: port,
    });

export const getCollapsePowerSection = () =>
    store<StoreSchema>().get(COLLAPSE_POWER_SECTION, false);
export const setCollapsePowerSection = (collapsePowerSection: boolean) =>
    store<StoreSchema>().set(COLLAPSE_POWER_SECTION, collapsePowerSection);

export const getCollapseTraceDetailsSection = () =>
    store<StoreSchema>().get(COLLAPSE_TRACE_DETAILS_SECTION, false);
export const setCollapseTraceDetailsSection = (
    collapseTraceDetailsSection: boolean
) =>
    store<StoreSchema>().set(
        COLLAPSE_TRACE_DETAILS_SECTION,
        collapseTraceDetailsSection
    );
