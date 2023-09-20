/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import {
    getManualDbFilePath as getPersistedManualDbFilePath,
    getTraceFormats as restoreTraceFormats,
    restoreRefreshOnStart,
    restoreResetDevice,
    setTraceFormats as storeTraceFormats,
    storeRefreshOnStart,
    storeResetDevice,
} from '../../utils/store';
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
    traceSerialPort: string | null;
    availableSerialPorts: string[];
    manualDbFilePath?: string;
    detectingTraceDb: boolean;
    selectedFormats: TraceFormat[];
    showConflictingSettingsDialog: boolean;
    // From Device config.prj --> AT_HOST=y
    // Which is optional from our documentation
    detectedAtHostLibrary: boolean;
    isSendingATCommands: boolean;
    resetDevice: boolean;
    refreshOnStart: boolean;
    detectedTraceDbFailed: boolean;
}

const initialState = (): TraceState => ({
    traceProgress: [],
    taskId: null,
    dataReceived: false,
    sourceFilePath: null,
    traceSerialPort: null,
    availableSerialPorts: [],
    manualDbFilePath: getPersistedManualDbFilePath(),
    detectingTraceDb: false,
    selectedFormats: restoreTraceFormats(),
    showConflictingSettingsDialog: false,
    detectedAtHostLibrary: false,
    isSendingATCommands: false,
    resetDevice: restoreResetDevice(),
    refreshOnStart: restoreRefreshOnStart(),
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
        setTraceSerialPort: (state, action: PayloadAction<string | null>) => {
            state.traceSerialPort = action.payload;
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
        setRefreshOnStart: (state, action: PayloadAction<boolean>) => {
            state.refreshOnStart = action.payload;
            storeRefreshOnStart(action.payload);
        },
        setDetectTraceDbFailed: (state, action: PayloadAction<boolean>) => {
            state.detectedTraceDbFailed = action.payload;
        },
    },
});

export const getTaskId = (state: RootState) => state.app.trace.taskId;

export const getIsTracing = (state: RootState) =>
    state.app.trace.taskId != null;

export const getTraceSerialPort = (state: RootState) =>
    state.app.trace.traceSerialPort;
export const getIsDeviceSelected = (state: RootState) =>
    state.app.trace.traceSerialPort != null;

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

export const getRefreshOnStart = (state: RootState) => state.app.trace.refreshOnStart;

export const getDetectTraceDbFailed = (state: RootState) =>
    state.app.trace.detectedTraceDbFailed;

export const {
    resetTraceInfo,
    setTraceIsStarted,
    setTraceIsStopped,
    setTraceProgress,
    setTraceDataReceived,
    setTraceSourceFilePath,
    setTraceSerialPort,
    setAvailableSerialPorts,
    setManualDbFilePath,
    resetManualDbFilePath,
    setDetectingTraceDb,
    setTraceFormats,
    setShowConflictingSettingsDialog,
    setDetectedAtHostLibrary,
    setIsSendingATCommands,
    setResetDevice,
    setRefreshOnStart,
    setDetectTraceDbFailed,
} = traceSlice.actions;

export default traceSlice.reducer;
