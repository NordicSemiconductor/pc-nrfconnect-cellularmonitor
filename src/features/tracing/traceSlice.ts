/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerialPort } from 'pc-nrfconnect-shared';

import type { RootState } from '../../appReducer';
import {
    deleteDbFilePath as deletePersistedDbFilePath,
    getManualDbFilePath as getPersistedManualDbFilePath,
    setManualDbFilePath as setPersistedManualDbFilePath,
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
    serialPort: string | null;
    availableSerialPorts: string[];
    manualDbFilePath?: string;
    detectingTraceDb: boolean;
    readonly uartSerialPort: SerialPort | null;
}

const initialState = (): TraceState => ({
    traceProgress: [],
    taskId: null,
    serialPort: null,
    availableSerialPorts: [],
    manualDbFilePath: getPersistedManualDbFilePath(),
    detectingTraceDb: false,
    uartSerialPort: null,
});

const traceSlice = createSlice({
    name: 'trace',
    initialState: initialState(),
    reducers: {
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

        setAvailableSerialPorts: (state, action: PayloadAction<string[]>) => {
            state.availableSerialPorts = action.payload;
        },
        setSerialPort: (state, action: PayloadAction<string | null>) => {
            state.serialPort = action.payload;
        },
        setManualDbFilePath: (state, action: PayloadAction<string>) => {
            state.manualDbFilePath = action.payload;
            setPersistedManualDbFilePath(action.payload);
        },
        resetManualDbFilePath: state => {
            deletePersistedDbFilePath();
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
export const getManualDbFilePath = (state: RootState) =>
    state.app.trace.manualDbFilePath;
export const getSelectedSerialNumber = (state: RootState) =>
    state.device.selectedSerialNumber;
export const getDetectingTraceDb = (state: RootState) =>
    state.app.trace.detectingTraceDb;

export const getUartSerialPort = (state: RootState) =>
    state.app.trace.uartSerialPort;

export const {
    setTraceIsStarted,
    setTraceIsStopped,
    setTraceProgress,
    setSerialPort,
    setAvailableSerialPorts,
    setManualDbFilePath,
    resetManualDbFilePath,
    setDetectingTraceDb,
    setUartSerialPort,
} = traceSlice.actions;

export default traceSlice.reducer;
