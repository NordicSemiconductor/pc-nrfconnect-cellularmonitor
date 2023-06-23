/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerialPort } from 'pc-nrfconnect-shared';

import type { RootState } from '../../appReducer';
import type { ShellParser } from '../shell/shellParser';

interface SerialPortState {
    readonly serialPort: SerialPort | null;
    readonly shellParser: ShellParser | null;
}

const initialState: SerialPortState = {
    serialPort: null,
    shellParser: null,
};

const serialPortSlice = createSlice({
    name: 'serialPort',
    initialState,
    reducers: {
        setSerialPort: (
            state,
            { payload: newSerialPort }: PayloadAction<SerialPort | null>
        ) => {
            if (state.serialPort?.path === newSerialPort?.path) return;
            if (state.serialPort != null) {
                state.serialPort.close();
            }
            if (newSerialPort != null) {
                state.serialPort = newSerialPort;
            }
        },
        closeSerialPort: state => {
            state.shellParser?.unregister();
            state.shellParser = null;

            state.serialPort?.close();
            state.serialPort = null;
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

export const getSerialPort = (state: RootState) =>
    state.app.serialPort.serialPort;

export const getShellParser = (state: RootState) =>
    state.app.serialPort.shellParser;

export const {
    setSerialPort,
    closeSerialPort,
    setShellParser,
    removeShellParser,
} = serialPortSlice.actions;

export default serialPortSlice.reducer;
