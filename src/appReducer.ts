/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import atReducer from './features/at/atSlice';
import chartSlice from './components/EventChart/Chart/chartSlice';
import modemReducer from './features/modem/modemSlice';
import powerEstimationReducer from './features/powerEstimation/powerEstimationSlice';
import traceReducer from './features/tracing/traceSlice';
import wiresharkReducer from './features/wireshark/wiresharkSlice';
import eventsReducer from './components/EventChart/eventsSlice';

type AppState = ReturnType<typeof appReducer>;

export type RootState = NrfConnectState<AppState>;

const appReducer = combineReducers({
    modem: modemReducer,
    trace: traceReducer,
    powerEstimation: powerEstimationReducer,
    wireshark: wiresharkReducer,
    at: atReducer,
    chart: chartSlice,
    events: eventsReducer,
});

export default appReducer;
