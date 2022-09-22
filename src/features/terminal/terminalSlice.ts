/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import { Modem } from './modem';

export interface LogEntry {
    type: 'user' | 'modem';
    value: string;
}

interface TerminalState {
    selectedSerialport?: string;
    modem?: Modem;
    popoutId?: number;
    logs: LogEntry[];
}

const initialState: TerminalState = {
    selectedSerialport: undefined,
    modem: undefined,
    popoutId: undefined,
    logs: [],
};

const terminalSlice = createSlice({
    name: 'modem',
    initialState,
    reducers: {
        setSelectedSerialport: (
            state,
            action: PayloadAction<string | undefined>
        ) => {
            state.selectedSerialport = action.payload;
        },
        setModem: (state, action: PayloadAction<Modem | undefined>) => {
            state.modem = action.payload;
        },
        setPopoutId: (state, action: PayloadAction<number | undefined>) => {
            state.popoutId = action.payload;
        },
        addLogEntry: (state, action: PayloadAction<LogEntry>) => {
            if (state.logs.length > 500) state.logs.shift();
            state.logs.push(action.payload);
        },
    },
});

export const getModem = (state: RootState) => state.app.terminal.modem;
export const getSelectedSerialport = (state: RootState) =>
    state.app.terminal.selectedSerialport;
export const getPopoutId = (state: RootState) => state.app.terminal.popoutId;
export const getTerminalLogs = (state: RootState) => state.app.terminal.logs;

export const { setModem, setSelectedSerialport, setPopoutId, addLogEntry } =
    terminalSlice.actions;
export default terminalSlice.reducer;
