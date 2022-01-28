/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../appReducer';
import { OnlinePowerEstimatorParams } from './onlinePowerEstimator';

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

const powerEstimationSlice = createSlice({
    name: 'powerEstimation',
    initialState,
    reducers: {
        setData: (state, action: PayloadAction<OnlinePowerEstimatorParams>) => {
            state.data = action.payload;
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
