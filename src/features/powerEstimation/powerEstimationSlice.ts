/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable camelcase */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import type { OnlinePowerEstimatorParams } from './onlinePowerEstimator';

interface PowerEstimationState {
    data: OnlinePowerEstimatorParams | null;
    filePath: string | null;
    renderedHtml: string | null;
    hasError: boolean;
    loading: boolean;
}

const initialState: PowerEstimationState = {
    data: null,
    filePath: null,
    renderedHtml: null,
    hasError: false,
    loading: false,
};

interface TAU_TYPES {
    SLEEP_INTERVAL: 0;
    ACTIVE_TIMER: 1;
}
const TAU_TYPE: TAU_TYPES = {
    SLEEP_INTERVAL: 0,
    ACTIVE_TIMER: 1,
};

const powerEstimationSlice = createSlice({
    name: 'powerEstimation',
    initialState,
    reducers: {
        setData: (state, action: PayloadAction<OnlinePowerEstimatorParams>) => {
            const { config_lte_psm_req_rptau, config_lte_psm_req_rat } =
                action.payload;
            const newTAUValue = config_lte_psm_req_rptau
                ? parseTAUByteToSeconds(
                      config_lte_psm_req_rptau,
                      TAU_TYPE.SLEEP_INTERVAL
                  )
                : state.data?.config_lte_psm_req_rptau;
            const newActiveTimer = config_lte_psm_req_rat
                ? parseTAUByteToSeconds(
                      config_lte_psm_req_rat,
                      TAU_TYPE.ACTIVE_TIMER
                  )
                : state.data?.config_lte_psm_req_rat;

            console.log(`newActiveTimer is now set to: ${newActiveTimer}`);

            state.data = action.payload;
            if (newTAUValue != null) {
                state.data.psm_int = `${newTAUValue}`;
            }
            if (newActiveTimer != null) {
                state.data.idrx_len = `${newActiveTimer}`;
            }
        },
        setFilePath: (state, action: PayloadAction<string>) => {
            state.filePath = action.payload;
        },
        resetParams: state => {
            state.data = null;
            state.filePath = null;
            state.renderedHtml = null;
            state.hasError = false;
        },
        setRenderedHtml: (state, action: PayloadAction<string>) => {
            state.renderedHtml = action.payload;
        },
        setHasError: (state, action: PayloadAction<boolean>) => {
            state.hasError = action.payload;
        },
        setIsLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const getData = (state: RootState) => state.app.powerEstimation.data;
export const getFilePath = (state: RootState) =>
    state.app.powerEstimation.filePath;
export const getRenderedHtml = (state: RootState) =>
    state.app.powerEstimation.renderedHtml;
export const hasError = (state: RootState) =>
    state.app.powerEstimation.hasError;
export const getIsLoading = (state: RootState) =>
    state.app.powerEstimation.loading;

export const {
    setData,
    setFilePath,
    resetParams,
    setRenderedHtml,
    setHasError,
    setIsLoading,
} = powerEstimationSlice.actions;

export default powerEstimationSlice.reducer;

const TAU_DEFAULT_VALUE = 0;
const TAU_SLEEP_INTERVAL_BASE_VALUES = {
    '000': 600,
    '001': 3600,
    '010': 36000,
    '011': 2,
    '100': 30,
    '101': 60,
};
const TAU_ACTIVE_TIMER_BASE_VALUES = {
    '000': 2,
    '001': 60,
};

function parseTAUByteToSeconds(byteString: string, type: number) {
    const byteArray = [...byteString.trim()];
    if (!(byteArray.length === 8)) {
        return TAU_DEFAULT_VALUE;
    }
    const TAU_BASE_VALUE = byteArray.slice(0, 3).join('');

    if (type === TAU_TYPE.SLEEP_INTERVAL) {
        if (!(TAU_BASE_VALUE in TAU_SLEEP_INTERVAL_BASE_VALUES)) {
            return TAU_DEFAULT_VALUE;
        }
    }
    if (type === TAU_TYPE.ACTIVE_TIMER) {
        if (!(TAU_BASE_VALUE in TAU_ACTIVE_TIMER_BASE_VALUES)) {
            return TAU_DEFAULT_VALUE;
        }
    }

    const TAU_BASE_MULTIPLIER =
        type === TAU_TYPE.SLEEP_INTERVAL
            ? TAU_SLEEP_INTERVAL_BASE_VALUES[TAU_BASE_VALUE]
            : TAU_ACTIVE_TIMER_BASE_VALUES[TAU_BASE_VALUE];

    const TAU_BINARY_VALUE = Number.parseInt(byteArray.slice(3).join(''), 2);

    return TAU_BASE_MULTIPLIER * TAU_BINARY_VALUE;
}
