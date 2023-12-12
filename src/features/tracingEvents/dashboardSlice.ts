/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../app/appReducer';
import { initialState } from './at';
import { RRCState, State } from './types';

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: initialState(),
    reducers: {
        resetDashboardState: () => ({
            ...initialState(),
        }),
        setDashboardState: (_, action: PayloadAction<State>) => action.payload,

        setRRCState: (state, action: PayloadAction<RRCState>) => {
            state.rrcState = action.payload;
        },
    },
});

export const getDashboardState = (state: RootState) => state.app.dashboard;
export const getPowerSavingMode = (state: RootState) =>
    state.app.dashboard.powerSavingMode;
export const { resetDashboardState, setDashboardState } =
    dashboardSlice.actions;
export default dashboardSlice.reducer;
