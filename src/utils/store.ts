/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getAppFile,
    getPersistentStore,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import path from 'path';

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
    refreshOnStart: boolean;
}

const store = getPersistentStore<StoreSchema>({
    migrations: {
        '0.4.5': instance => {
            instance.set('traceFormats', ['raw', 'tshark']);
        },
        '0.9.1': instance => {
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

export const [restoreResetDevice, storeResetDevice] = fromStore(
    'resetDevice',
    false
);

export const [restoreRefreshOnStart, storeRefreshOnStart] = fromStore(
    'refreshOnStart',
    true
);
