/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import { initialState, State } from './index';

const atSlice = createSlice({
    name: 'at',
    initialState: initialState(),
    reducers: {
        setAT: (state, action: PayloadAction<State>) => ({ ...action.payload }),
    },
});

export const getAT = (state: RootState) => state.app.at;
export const getSIM = (state: RootState) => {
    const { at } = state.app;

    return {
        imsi: at.imsi,
        operator: at.xmonitor?.operatorFullName,
        manufacturer: at.manufacturer,
        iccid: at.iccid,
        pin: at.pinCodeStatus,
        remainingPIN: at.pinRetries?.SIM_PIN,
        remainingPUK: at.pinRetries?.SIM_PUK,
        remainingPIN2: at.pinRetries?.SIM_PIN2,
        remainingPUK2: at.pinRetries?.SIM_PUK2,
    };
};

export const { setAT } = atSlice.actions;
export default atSlice.reducer;
