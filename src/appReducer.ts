/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import powerEstimationReducer from './features/powerEstimation/powerEstimationSlice';
import terminalReducer from './features/terminal/terminalSlice';
import traceReducer from './features/tracing/traceSlice';
import wiresharkReducer from './features/wireshark/wiresharkSlice';

type AppState = ReturnType<typeof appReducer>;

export type RootState = NrfConnectState<AppState>;

const appReducer = combineReducers({
    terminal: terminalReducer,
    trace: traceReducer,
    powerEstimation: powerEstimationReducer,
    wireshark: wiresharkReducer,
});

export default appReducer;
