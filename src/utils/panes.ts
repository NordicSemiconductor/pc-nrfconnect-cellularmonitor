/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { currentPane } from 'pc-nrfconnect-shared';

import { RootState } from '../appReducer';

const TRACE_COLLECTOR = 0;
const POWER_ESTIMATION = 1;

export const isTraceCollectorPane = (state: RootState) =>
    currentPane(state) === TRACE_COLLECTOR;
export const isPowerEstimationPane = (state: RootState) =>
    currentPane(state) === POWER_ESTIMATION;
