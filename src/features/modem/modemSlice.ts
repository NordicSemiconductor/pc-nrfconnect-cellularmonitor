/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SerialPort } from 'pc-nrfconnect-shared';

import type { RootState } from '../../appReducer';
import { Modem } from './modem';

interface ModemState {
    readonly uartSerialPort: SerialPort | null;
    readonly modem: Modem | null;
}

const initialState: ModemState = {
    uartSerialPort: null,
    modem: null,
};

const modemSlice = createSlice({
    name: 'modem',
    initialState,
    reducers: {
        setUartSerialPort: (state, action: PayloadAction<SerialPort>) => {
            state.uartSerialPort = action.payload;
        },
        setModem: (state, action: PayloadAction<Modem>) => {
            state.modem = action.payload;
        },
    },
});

export const getUartSerialPort = (state: RootState) =>
    state.app.modem.uartSerialPort;
export const getModem = (state: RootState) => state.app.modem.modem;

export const { setUartSerialPort, setModem } = modemSlice.actions;
export default modemSlice.reducer;
