import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NrfConnectState } from 'pc-nrfconnect-shared';

import {
    deleteDbFilePath as deletePersistedDbFilePath,
    getManualDbFilePath as getPersistedManualDbFilePath,
    getWiresharkPath as getPersistedWiresharkPath,
    setManualDbFilePath as setPersistedManualDbFilePath,
    setWiresharkPath as setPersistedWiresharkPath,
} from '../../utils/store';
import { TaskId } from './nrfml';

export interface TraceState {
    tracePath: string;
    traceSize: number;
    taskId: TaskId | null;
    serialPort: string | null;
    availableSerialPorts: string[];
    manualDbFilePath?: string;
    wiresharkPath: string | null;
}

const initialState = (): TraceState => ({
    tracePath: '',
    traceSize: 0,
    taskId: null,
    serialPort: null,
    availableSerialPorts: [],
    manualDbFilePath: getPersistedManualDbFilePath(),
    wiresharkPath: getPersistedWiresharkPath(),
});

const traceSlice = createSlice({
    name: 'trace',
    initialState: initialState(),
    reducers: {
        setTaskId: (state, action: PayloadAction<TaskId>) => {
            state.taskId = action.payload;
        },
        setTracePath: (state, action: PayloadAction<string>) => {
            state.tracePath = action.payload;
        },
        setTraceSize: (state, action: PayloadAction<number>) => {
            state.traceSize = action.payload;
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
    },
});

type State = {
    trace: TraceState;
};

export type RootState = NrfConnectState<State>;

export const getTaskId = (state: RootState) => state.app.trace.taskId;
export const getSerialPort = (state: RootState) => state.app.trace.serialPort;
export const getAvailableSerialPorts = (state: RootState) =>
    state.app.trace.availableSerialPorts;
export const getTracePath = (state: RootState) => state.app.trace.tracePath;
export const getTraceSize = (state: RootState) => state.app.trace.traceSize;
export const getManualDbFilePath = (state: RootState) =>
    state.app.trace.manualDbFilePath;
export const getWiresharkPath = (state: RootState) =>
    state.app.trace.wiresharkPath;
export const getSelectedSerialNumber = (state: RootState) =>
    state.device.selectedSerialNumber;

export const {
    setTaskId,
    setTracePath,
    setTraceSize,
    setSerialPort,
    setAvailableSerialPorts,
    setManualDbFilePath,
    resetManualDbFilePath,
    setWiresharkPath,
} = traceSlice.actions;

export default traceSlice.reducer;
