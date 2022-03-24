/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../appReducer';

interface PortState {
    port?: MessagePort;
}

const initialState: PortState = {
    port: undefined,
};

const portSlice = createSlice({
    name: 'port',
    initialState,
    reducers: {
        setPort: (state, action: PayloadAction<MessagePort>) => {
            state.port = action.payload;
        },
    },
});

export const getPort = (state: RootState) => state.app.port.port;

export const { setPort } = portSlice.actions;
export default portSlice.reducer;
