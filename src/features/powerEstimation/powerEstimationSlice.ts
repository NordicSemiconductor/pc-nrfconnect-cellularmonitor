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

enum TAU_TYPES {
    SLEEP_INTERVAL = 0,
    ACTIVE_TIMER = 1,
}

const powerEstimationSlice = createSlice({
    name: 'powerEstimation',
    initialState,
    reducers: {
        setData: (state, action: PayloadAction<OnlinePowerEstimatorParams>) => {
            const { config_lte_psm_req_rptau, config_lte_psm_req_rat } =
                action.payload;

            state.data = action.payload;

            if (config_lte_psm_req_rptau != null) {
                const newTAUValue = parseTAUByteToSeconds(
                    config_lte_psm_req_rptau,
                    TAU_TYPES.SLEEP_INTERVAL
                );
                state.data.psm_int = `${newTAUValue}`;
            }
            if (config_lte_psm_req_rat != null) {
                const newActiveTimer = parseTAUByteToSeconds(
                    config_lte_psm_req_rat,
                    TAU_TYPES.ACTIVE_TIMER
                );
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
const TAU_SLEEP_INTERVAL_BASE_VALUES: { [index: string]: number } = {
    '000': 600,
    '001': 3600,
    '010': 36000,
    '011': 2,
    '100': 30,
    '101': 60,
};
const TAU_ACTIVE_TIMER_BASE_VALUES: { [index: string]: number } = {
    '000': 2,
    '001': 60,
};

const parseTAUByteToSeconds = (byteString: string, type: TAU_TYPES) => {
    const byteArray = [...byteString.trim()];

    if (byteArray.length !== 8) return TAU_DEFAULT_VALUE;

    const TAU_BASE_VALUE = byteArray.slice(0, 3).join('');
    const TAU_BINARY_VALUE = Number.parseInt(byteArray.slice(3).join(''), 2);

    if (
        type === TAU_TYPES.SLEEP_INTERVAL &&
        TAU_BASE_VALUE in TAU_SLEEP_INTERVAL_BASE_VALUES
    )
        return (
            TAU_SLEEP_INTERVAL_BASE_VALUES[TAU_BASE_VALUE] * TAU_BINARY_VALUE
        );

    if (
        type === TAU_TYPES.ACTIVE_TIMER &&
        TAU_BASE_VALUE in TAU_ACTIVE_TIMER_BASE_VALUES
    )
        return TAU_ACTIVE_TIMER_BASE_VALUES[TAU_BASE_VALUE] * TAU_BINARY_VALUE;

    return TAU_DEFAULT_VALUE;
};
