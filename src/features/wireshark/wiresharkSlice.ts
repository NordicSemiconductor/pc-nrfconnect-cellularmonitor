/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../appReducer';
import {
    getTsharkPath as getPersistedTsharkPath,
    getWiresharkPath as getPersistedWiresharkPath,
    setTsharkPath as setPersistedTsharkPath,
    setWiresharkPath as setPersistedWiresharkPath,
} from '../../utils/store';

interface WiresharkState {
    wiresharkPath: string | null;
    tsharkPath: string | null;
}

const initialState = (): WiresharkState => ({
    wiresharkPath: getPersistedWiresharkPath(),
    tsharkPath: getPersistedTsharkPath(),
});

const wiresharkSlice = createSlice({
    name: 'wireshark',
    initialState: initialState(),
    reducers: {
        setWiresharkPath: (state, action: PayloadAction<string>) => {
            state.wiresharkPath = action.payload;
            setPersistedWiresharkPath(action.payload);
        },
        setTsharkPath: (state, action: PayloadAction<string>) => {
            state.tsharkPath = action.payload;
            setPersistedTsharkPath(action.payload);
        },
    },
});

export const getWiresharkPath = (state: RootState) =>
    state.app.wireshark.wiresharkPath;
export const getTsharkPath = (state: RootState) =>
    state.app.wireshark.tsharkPath;

export const { setWiresharkPath, setTsharkPath } = wiresharkSlice.actions;

export default wiresharkSlice.reducer;
