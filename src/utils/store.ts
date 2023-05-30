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
    showStartupDialog: boolean;
    resetDevice: boolean;
    refreshDashboard: boolean;
}

const store = getPersistentStore<StoreSchema>({
    migrations: {
        '0.4.5': instance => {
            instance.set('traceFormats', ['raw', 'tshark']);
        },
        '0.9.0': instance => {
            instance.set('traceFormats', ['raw']);
        },
    },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromStore = <T extends keyof StoreSchema>(key: T, defaultValue?: any) =>
    [
        () => store.get(key, defaultValue),
        (value: StoreSchema[T]) => store.set(key, value),
    ] as const;

export const autoDetectDbRootFolder = () =>
    getAppFile(path.join('resources', 'traceDB')) as string;

const serialPorts = () => store.get('serialPorts', {});
export const getSerialPort = (serialNumber: string) =>
    serialPorts()[serialNumber];

export const setSerialPort = (serialNumber: string, port: string) =>
    store.set('serialPorts', {
        ...serialPorts(),
        [serialNumber]: port,
    });

export const [getManualDbFilePath, storeManualDbFilePath] =
    fromStore('dbFilePath');

export const deleteDbFilePath = () => store.delete('dbFilePath');

export const [getWiresharkPath, setWiresharkPath] = fromStore(
    'wiresharkExecutablePath',
    null
);

export const [getTsharkPath, setTsharkPath] = fromStore('tsharkExecutablePath');

export const [getTraceFormats, setTraceFormats] = fromStore(
    'traceFormats',
    ALL_TRACE_FORMATS.slice(0, 1)
);

export const [getCollapsePowerSection, setCollapsePowerSection] = fromStore(
    'collapsePowerSection',
    false
);

export const [
    getCollapseConnectionStatusSection,
    setCollapseConnectionStatusSection,
] = fromStore('connectionStatusSection', false);

export const [getShowStartupDialog, setShowStartupDialog] = fromStore(
    'showStartupDialog',
    true
);

export const [restoreRefreshDashboard, storeRefreshDashboard] = fromStore(
    'refreshDashboard',
    true
);

export const [restoreResetDevice, storeResetDevice] = fromStore(
    'resetDevice',
    false
);
