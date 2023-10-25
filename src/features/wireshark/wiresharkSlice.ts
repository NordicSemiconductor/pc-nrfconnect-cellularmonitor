/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import {
    getWiresharkPath as getPersistedWiresharkPath,
    setWiresharkPath as setPersistedWiresharkPath,
} from '../../utils/store';

interface WiresharkState {
    wiresharkPath: string | null;
}

const initialState = (): WiresharkState => ({
    wiresharkPath: getPersistedWiresharkPath(),
});

const wiresharkSlice = createSlice({
    name: 'wireshark',
    initialState: initialState(),
    reducers: {
        setWiresharkPath: (state, action: PayloadAction<string>) => {
            state.wiresharkPath = action.payload;
            setPersistedWiresharkPath(action.payload);
        },
    },
});

export const getWiresharkPath = (state: RootState) =>
    state.app.wireshark.wiresharkPath;

export const { setWiresharkPath } = wiresharkSlice.actions;

export default wiresharkSlice.reducer;
