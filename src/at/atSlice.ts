/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../appReducer';
import { initialState, State } from './index';

const atSlice = createSlice({
    name: 'at',
    initialState: initialState(),
    reducers: {
        setAT: (state, action: PayloadAction<State>) => ({ ...action.payload }),
    },
});

export const getAT = (state: RootState) => state.app.at;

export const { setAT } = atSlice.actions;
export default atSlice.reducer;