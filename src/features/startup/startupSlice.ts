/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../app/appReducer';
import {
    getShowStartupDialog as getPersistedShowStartupDialogOnAppStart,
    setShowStartupDialog as setPersistedShowStartupDialogOnAppStart,
} from '../../app/store';

interface Startup {
    showStartupDialog: boolean;
    showStartupDialogOnAppStart: boolean;
}

const initialState = (): Startup => ({
    showStartupDialog: false,
    showStartupDialogOnAppStart: getPersistedShowStartupDialogOnAppStart(),
});

const startupSlice = createSlice({
    name: 'startup',
    initialState: initialState(),
    reducers: {
        setShowStartupDialog: (state, action: PayloadAction<boolean>) => {
            state.showStartupDialog = action.payload;
        },
        setShowStartupDialogOnAppStart: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.showStartupDialogOnAppStart = action.payload;
            setPersistedShowStartupDialogOnAppStart(action.payload);
        },
    },
});

export const getShowStartupDialog = (state: RootState) =>
    state.app.startup.showStartupDialog;
export const getShowStartupDialogOnAppStart = (state: RootState) =>
    state.app.startup.showStartupDialogOnAppStart;

export const { setShowStartupDialog, setShowStartupDialogOnAppStart } =
    startupSlice.actions;

export default startupSlice.reducer;
