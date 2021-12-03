/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../reducers';
import {
    deleteDbFilePath as deletePersistedDbFilePath,
    getManualDbFilePath as getPersistedManualDbFilePath,
    getWiresharkPath as getPersistedWiresharkPath,
    setManualDbFilePath as setPersistedManualDbFilePath,
    setWiresharkPath as setPersistedWiresharkPath,
} from '../../utils/store';
import { TaskId } from './nrfml';
import { TraceFormat } from './sinks';

export interface TraceProgress {
    format: TraceFormat;
    path: string;
    size: number;
}

export interface TraceState {
    traceData: TraceProgress[];
    taskId: TaskId | null;
    serialPort: string | null;
    availableSerialPorts: string[];
    manualDbFilePath?: string;
    wiresharkPath: string | null;
    detectingTraceDb: boolean;
}

const initialState = (): TraceState => ({
    traceData: [],
    taskId: null,
    serialPort: null,
    availableSerialPorts: [],
    manualDbFilePath: getPersistedManualDbFilePath(),
    wiresharkPath: getPersistedWiresharkPath(),
    detectingTraceDb: false,
});

const traceSlice = createSlice({
    name: 'trace',
    initialState: initialState(),
    reducers: {
        setTaskId: (state, action: PayloadAction<TaskId | null>) => {
            state.taskId = action.payload;
        },
        setTraceData: (state, action: PayloadAction<TraceProgress[]>) => {
            state.traceData = action.payload;
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
        setWiresharkPath: (state, action: PayloadAction<string>) => {
            state.wiresharkPath = action.payload;
            setPersistedWiresharkPath(action.payload);
        },
        setDetectingTraceDb: (state, action: PayloadAction<boolean>) => {
            state.detectingTraceDb = action.payload;
        },
    },
});

export const getTaskId = (state: RootState) => state.app.trace.taskId;
export const getIsTracing = (state: RootState) =>
    state.app.trace.taskId != null;
export const getSerialPort = (state: RootState) => state.app.trace.serialPort;
export const getAvailableSerialPorts = (state: RootState) =>
    state.app.trace.availableSerialPorts;
export const getTraceData = (state: RootState) => state.app.trace.traceData;
export const getManualDbFilePath = (state: RootState) =>
    state.app.trace.manualDbFilePath;
export const getWiresharkPath = (state: RootState) =>
    state.app.trace.wiresharkPath;
export const getSelectedSerialNumber = (state: RootState) =>
    state.device.selectedSerialNumber;
export const getDetectingTraceDb = (state: RootState) =>
    state.app.trace.detectingTraceDb;

export const {
    setTaskId,
    setTraceData,
    setSerialPort,
    setAvailableSerialPorts,
    setManualDbFilePath,
    resetManualDbFilePath,
    setWiresharkPath,
    setDetectingTraceDb,
} = traceSlice.actions;

export default traceSlice.reducer;
