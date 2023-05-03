/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import chartSlice from './components/EventChart/Chart/chartSlice';
import modemReducer from './features/modem/modemSlice';
import startupReducer from './features/startup/startupSlice';
import traceReducer from './features/tracing/traceSlice';
import dashboardReducer from './features/tracingEvents/dashboardSlice';
import wiresharkReducer from './features/wireshark/wiresharkSlice';

type AppState = ReturnType<typeof appReducer>;

export type RootState = NrfConnectState<AppState>;

const appReducer = combineReducers({
    modem: modemReducer,
    trace: traceReducer,
    wireshark: wiresharkReducer,
    dashboard: dashboardReducer,
    chart: chartSlice,
    startup: startupReducer,
});

export default appReducer;
