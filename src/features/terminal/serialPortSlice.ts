/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { SerialPort } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../app/appReducer';
import type { ShellParser } from '../shell/shellParser';

interface SerialPortState {
    readonly terminalSerialPort: SerialPort | null;
    readonly shellParser: ShellParser | null;
}

const initialState: SerialPortState = {
    terminalSerialPort: null,
    shellParser: null,
};

const serialPortSlice = createSlice({
    name: 'terminalSerialPort',
    initialState,
    reducers: {
        setTerminalSerialPort: (
            state,
            { payload: newSerialPort }: PayloadAction<SerialPort | null>
        ) => {
            if (state.terminalSerialPort?.path === newSerialPort?.path) return;
            if (state.terminalSerialPort != null) {
                state.terminalSerialPort.close();
            }
            if (newSerialPort != null) {
                state.terminalSerialPort = newSerialPort;
            }
        },
        closeTerminalSerialPort: state => {
            state.shellParser?.unregister();
            state.shellParser = null;

            state.terminalSerialPort?.close();
            state.terminalSerialPort = null;
        },
        setShellParser: (state, action: PayloadAction<ShellParser>) => {
            if (state.shellParser != null) {
                state.shellParser.unregister();
            }
            state.shellParser = action.payload;
        },
        removeShellParser: state => {
            if (state.shellParser != null) {
                state.shellParser.unregister();
                state.shellParser = null;
            }
        },
    },
});

export const getTerminalSerialPort = (state: RootState) =>
    state.app.serialPort.terminalSerialPort;

export const getShellParser = (state: RootState) =>
    state.app.serialPort.shellParser;

export const {
    setTerminalSerialPort,
    closeTerminalSerialPort,
    setShellParser,
    removeShellParser,
} = serialPortSlice.actions;

export default serialPortSlice.reducer;
