/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import { getAppFile, getPersistentStore } from 'pc-nrfconnect-shared';

import { ALL_TRACE_FORMATS, TraceFormat } from '../features/tracing/formats';

interface StoreSchema {
    dbFilePath: string | undefined;
    wiresharkExecutablePath: string | null;
    tsharkExecutablePath: string | null;
    traceFormats: TraceFormat[];
    serialPorts: {
        [serialNumber: string]: string;
    };
    collapsePowerSection: boolean;
    collapseTraceDetailsSection: boolean;
    connectionStatusSection: boolean;
    resetDevice: boolean;
    refreshDashboard: boolean;
}

const store = getPersistentStore<StoreSchema>({
    migrations: {
        '0.4.5': instance => {
            instance.set('traceFormats', ['raw', 'tshark']);
        },
    },
});

export const autoDetectDbRootFolder = () =>
    getAppFile(path.join('resources', 'traceDB')) as string;

export const getManualDbFilePath = () => store.get('dbFilePath');
export const storeManualDbFilePath = (manualDbFilePath: string) =>
    store.set('dbFilePath', manualDbFilePath);
export const deleteDbFilePath = () => store.delete('dbFilePath');

export const getWiresharkPath = () =>
    store.get('wiresharkExecutablePath', null);
export const setWiresharkPath = (wiresharkPath: string) =>
    store.set('wiresharkExecutablePath', wiresharkPath);

export const getTsharkPath = () => store.get('tsharkExecutablePath', null);
export const setTsharkPath = (tsharkPath: string) =>
    store.set('tsharkExecutablePath', tsharkPath);

export const getTraceFormats = () =>
    store.get('traceFormats', [ALL_TRACE_FORMATS[0]]);
export const setTraceFormats = (traceFormats: TraceFormat[]) =>
    store.set('traceFormats', traceFormats);

const serialPorts = () => store.get('serialPorts', {});
export const getSerialPort = (serialNumber: string) =>
    serialPorts()[serialNumber];

export const setSerialPort = (serialNumber: string, port: string) =>
    store.set('serialPorts', {
        ...serialPorts(),
        [serialNumber]: port,
    });

export const getCollapsePowerSection = () =>
    store.get('collapsePowerSection', false);
export const setCollapsePowerSection = (collapsePowerSection: boolean) =>
    store.set('collapsePowerSection', collapsePowerSection);

export const getCollapseConnectionStatusSection = () =>
    store.get('connectionStatusSection', false);
export const setCollapseConnectionStatusSection = (
    collapseConnectionStatusSection: boolean
) => store.set('connectionStatusSection', collapseConnectionStatusSection);

export const setShowStartupDialog = (showStartupDialog: boolean) =>
    store.set('showStartupDialog', showStartupDialog);
export const getShowStartupDialog = () => store.get('showStartupDialog', true);

export const storeResetDevice = (resetDevice: boolean) =>
    store.set('resetDevice', resetDevice);
export const restoreResetDevice = () => store.get('resetDevice', false);

export const storeRefreshDashboard = (refreshDashboard: boolean) =>
    store.set('refreshDashboard', refreshDashboard);
export const restoreRefreshDashboard = () =>
    store.get('refreshDashboard', false);
