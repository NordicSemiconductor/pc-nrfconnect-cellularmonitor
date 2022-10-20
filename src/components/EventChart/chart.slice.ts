/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';

interface State {
    time: number;
}

const initialState = (): State => ({
    time: Date.now() + 24 * 60 * 60 * 1000, // now + 1 day
});

const slice = createSlice({
    name: 'timeline',
    initialState: initialState(),
    reducers: {
        setSelectedTime: (state, action: PayloadAction<number>) => {
            state.time = action.payload;
        },
    },
});

export const getSelectedTime = (state: RootState) => state.app.chart.time;
export const { setSelectedTime } = slice.actions;
export default slice.reducer;
