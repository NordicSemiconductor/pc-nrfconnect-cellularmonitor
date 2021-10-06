/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import modemReducer, { ModemState } from './features/modem/modemSlice';
import traceReducer, { TraceState } from './features/tracing/traceSlice';

type AppState = {
    modem: ModemState;
    trace: TraceState;
};

export type RootState = NrfConnectState<AppState>;

export default combineReducers({
    modem: modemReducer,
    trace: traceReducer,
});
