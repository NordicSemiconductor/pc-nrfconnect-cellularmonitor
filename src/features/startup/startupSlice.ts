/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import {
    getShowStartupDialog as getPersistedShowStartupDialog,
    setShowStartupDialog as setPersistedShowStartupDialog,
} from '../../utils/store';

interface Startup {
    showStartupDialog: boolean;
}

const initialState = (): Startup => ({
    showStartupDialog: getPersistedShowStartupDialog(),
});

const startupSlice = createSlice({
    name: 'startup',
    initialState: initialState(),
    reducers: {
        setShowStartupDialog: (state, action: PayloadAction<boolean>) => {
            state.showStartupDialog = action.payload;
            setPersistedShowStartupDialog(action.payload);
        },
    },
});

export const getShowStartupDialog = (state: RootState) =>
    state.app.startup.showStartupDialog;

export const { setShowStartupDialog } = startupSlice.actions;

export default startupSlice.reducer;
