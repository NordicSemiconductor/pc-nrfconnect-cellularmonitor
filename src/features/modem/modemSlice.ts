/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import { Modem } from './modem';

interface ModemState {
    readonly modem: Modem | null;
}

const initialState: ModemState = {
    modem: null,
};

const modemSlice = createSlice({
    name: 'modem',
    initialState,
    reducers: {
        setModem: (state, action: PayloadAction<Modem>) => {
            state.modem = action.payload;
        },
    },
});

export const getModem = (state: RootState) => state.app.modem.modem;

export const { setModem } = modemSlice.actions;
export default modemSlice.reducer;
