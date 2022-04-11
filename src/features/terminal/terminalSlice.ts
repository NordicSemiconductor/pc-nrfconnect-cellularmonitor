/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../appReducer';
import { Modem } from './modem';

interface TerminalState {
    selectedSerialport?: string;
    modem?: Modem;
    popoutId?: number;
}

const initialState: TerminalState = {
    selectedSerialport: undefined,
    modem: undefined,
    popoutId: undefined,
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
    },
});

export const getModem = (state: RootState) => state.app.terminal.modem;
export const getSelectedSerialport = (state: RootState) =>
    state.app.terminal.selectedSerialport;
export const getPopoutId = (state: RootState) => state.app.terminal.popoutId;

export const { setModem, setSelectedSerialport, setPopoutId } =
    terminalSlice.actions;
export default terminalSlice.reducer;
