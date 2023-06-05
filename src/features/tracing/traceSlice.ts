/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerialPort } from 'pc-nrfconnect-shared';

import type { RootState } from '../../appReducer';
import {
    getManualDbFilePath as getPersistedManualDbFilePath,
    getTraceFormats as restoreTraceFormats,
    restoreResetDevice,
    setTraceFormats as storeTraceFormats,
    storeResetDevice,
} from '../../utils/store';
import { ShellParser } from '../shell/shellParser';
import { TraceFormat } from './formats';
import type { TaskId } from './nrfml';

export interface TraceProgress {
    format: TraceFormat;
    path: string;
    size?: number;
}
interface TraceState {
    traceProgress: TraceProgress[];
    taskId: TaskId | null;
    dataReceived: boolean;
    sourceFilePath: string | null;
    serialPort: string | null;
    availableSerialPorts: string[];
    manualDbFilePath?: string;
    detectingTraceDb: boolean;
    readonly uartSerialPort: SerialPort | null;
    readonly shellParser: ShellParser | null;
    selectedFormats: TraceFormat[];
    showConflictingSettingsDialog: boolean;
    // From Device config.prj --> AT_HOST=y
    // Which is optional from our documentation
    detectedAtHostLibrary: boolean;
    isSendingATCommands: boolean;
    resetDevice: boolean;
    detectedTraceDbFailed: boolean;
}

const initialState = (): TraceState => ({
    traceProgress: [],
    taskId: null,
    dataReceived: false,
    sourceFilePath: null,
    serialPort: null,
    availableSerialPorts: [],
    manualDbFilePath: getPersistedManualDbFilePath(),
    detectingTraceDb: false,
    uartSerialPort: null,
    shellParser: null,
    selectedFormats: restoreTraceFormats(),
    showConflictingSettingsDialog: false,
    detectedAtHostLibrary: false,
    isSendingATCommands: false,
    resetDevice: restoreResetDevice(),
    detectedTraceDbFailed: false,
});

const traceSlice = createSlice({
    name: 'trace',
    initialState: initialState(),
    reducers: {
        resetTraceInfo: state => {
            state.traceProgress = [];
            state.dataReceived = false;
            state.sourceFilePath = null;
        },
        setTraceIsStarted: (
            state,
            action: PayloadAction<{
                taskId: TaskId;
                progressConfigs: Pick<TraceProgress, 'format' | 'path'>[];
            }>
        ) => {
            state.taskId = action.payload.taskId;
            state.traceProgress = action.payload.progressConfigs.map(sink => ({
                ...sink,
                size: 0,
            }));
        },
        setTraceIsStopped: state => {
            state.taskId = null;
        },
        setTraceProgress: (
            state,
            action: PayloadAction<Pick<TraceProgress, 'path' | 'size'>>
        ) => {
            const progressToUpdate = state.traceProgress.find(
                progress => progress.path === action.payload.path
            );
            if (progressToUpdate != null) {
                progressToUpdate.size = action.payload.size;
            }
        },
        setTraceDataReceived: (state, action: PayloadAction<boolean>) => {
            state.dataReceived = action.payload;
        },
        setTraceSourceFilePath: (
            state,
            action: PayloadAction<string | null>
        ) => {
            state.sourceFilePath = action.payload;
        },

        setAvailableSerialPorts: (state, action: PayloadAction<string[]>) => {
            state.availableSerialPorts = action.payload;
        },
        setSerialPort: (state, action: PayloadAction<string | null>) => {
            state.serialPort = action.payload;
        },
        setManualDbFilePath: (
            state,
            action: PayloadAction<string | undefined>
        ) => {
            state.manualDbFilePath = action.payload;
        },
        resetManualDbFilePath: state => {
            state.manualDbFilePath = getPersistedManualDbFilePath();
        },
        setDetectingTraceDb: (state, action: PayloadAction<boolean>) => {
            state.detectingTraceDb = action.payload;
        },
        setUartSerialPort: (
            state,
            action: PayloadAction<SerialPort | null>
        ) => {
            if (state.uartSerialPort?.path === action.payload?.path) return;
            if (state.uartSerialPort != null) {
                state.uartSerialPort.close();
            }
            state.uartSerialPort = action.payload;
        },
        setShellParser: (state, action: PayloadAction<ShellParser>) => {
            state.shellParser = action.payload;
        },
        removeShellParser: state => {
            state.shellParser = null;
        },
        setTraceFormats: (state, action: PayloadAction<TraceFormat[]>) => {
            state.selectedFormats = action.payload;
            storeTraceFormats(action.payload);
        },
        setShowConflictingSettingsDialog: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.showConflictingSettingsDialog = action.payload;
        },
        setDetectedAtHostLibrary: (state, action: PayloadAction<boolean>) => {
            state.detectedAtHostLibrary = action.payload;
        },
        setIsSendingATCommands: (state, action: PayloadAction<boolean>) => {
            state.isSendingATCommands = action.payload;
        },
        setResetDevice: (state, action: PayloadAction<boolean>) => {
            state.resetDevice = action.payload;
            storeResetDevice(action.payload);
        },
        setDetectTraceDbFailed: (state, action: PayloadAction<boolean>) => {
            state.detectedTraceDbFailed = action.payload;
        },
    },
});

export const getTaskId = (state: RootState) => state.app.trace.taskId;

export const getIsTracing = (state: RootState) =>
    state.app.trace.taskId != null;

export const getSerialPort = (state: RootState) => state.app.trace.serialPort;
export const getIsDeviceSelected = (state: RootState) =>
    state.app.trace.serialPort != null;

export const getAvailableSerialPorts = (state: RootState) =>
    state.app.trace.availableSerialPorts;
export const getTraceProgress = (state: RootState) =>
    state.app.trace.traceProgress;
export const getTraceDataReceived = (state: RootState) =>
    state.app.trace.dataReceived;
export const getTraceSourceFilePath = (state: RootState) =>
    state.app.trace.sourceFilePath;
export const getManualDbFilePath = (state: RootState) =>
    state.app.trace.manualDbFilePath;
export const getSelectedSerialNumber = (state: RootState) =>
    state.device.selectedSerialNumber;
export const getDetectingTraceDb = (state: RootState) =>
    state.app.trace.detectingTraceDb;

export const getUartSerialPort = (state: RootState) =>
    state.app.trace.uartSerialPort;

export const getShellParser = (state: RootState) => state.app.trace.shellParser;

export const getTraceFormats = (state: RootState) =>
    state.app.trace.selectedFormats;

export const getOpenInWiresharkSelected = (state: RootState) =>
    state.app.trace.selectedFormats.includes('live');

export const getShowConflictingSettingsDialog = (state: RootState) =>
    state.app.trace.showConflictingSettingsDialog;

export const getDetectedAtHostLibrary = (state: RootState) =>
    state.app.trace.detectedAtHostLibrary;

export const getIsSendingATCommands = (state: RootState) =>
    state.app.trace.isSendingATCommands;

export const getResetDevice = (state: RootState) => state.app.trace.resetDevice;

export const getDetectTraceDbFailed = (state: RootState) =>
    state.app.trace.detectedTraceDbFailed;

export const {
    resetTraceInfo,
    setTraceIsStarted,
    setTraceIsStopped,
    setTraceProgress,
    setTraceDataReceived,
    setTraceSourceFilePath,
    setSerialPort,
    setAvailableSerialPorts,
    setManualDbFilePath,
    resetManualDbFilePath,
    setDetectingTraceDb,
    setUartSerialPort,
    setShellParser,
    removeShellParser,
    setTraceFormats,
    setShowConflictingSettingsDialog,
    setDetectedAtHostLibrary,
    setIsSendingATCommands,
    setResetDevice,
    setDetectTraceDbFailed,
} = traceSlice.actions;

export default traceSlice.reducer;
