/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/appReducer';
import { EVENT_TYPES, eventType } from '../../tracing/formats';

interface State {
    time: number;
    mode: 'Event' | 'Time';
    groupEvents: boolean;
    inactivityThreshold: number;
    traceEventFilter: eventType[];
    live: boolean;
    showOptionsDialog: boolean;
}

const initialState = (): State => ({
    time: Date.now() + 24 * 60 * 60 * 1000,
    mode: 'Event',
    groupEvents: true,
    inactivityThreshold: 0,
    traceEventFilter: [...EVENT_TYPES],
    live: true,
    showOptionsDialog: false,
});

const slice = createSlice({
    name: 'timeline',
    initialState: initialState(),
    reducers: {
        setSelectedTime: (state, action: PayloadAction<number>) => {
            state.time = action.payload;
        },
        toggleMode: state => {
            state.mode = state.mode === 'Event' ? 'Time' : 'Event';
        },
        toggleGroupEvents: state => {
            state.groupEvents = !state.groupEvents;
        },
        setInactivityThreshold: (state, action: PayloadAction<number>) => {
            state.inactivityThreshold = action.payload;
        },
        changeTraceEventFilter: (
            state,
            action: PayloadAction<{ type: eventType; enable: boolean }>
        ) => {
            if (action.payload.enable)
                state.traceEventFilter = EVENT_TYPES.filter(
                    e =>
                        e === action.payload.type ||
                        state.traceEventFilter.includes(e)
                );
            else
                state.traceEventFilter = state.traceEventFilter.filter(
                    e => e !== action.payload.type
                );
        },
        setLive: (state, action: PayloadAction<boolean>) => {
            state.live = action.payload;
        },
        setShowOptionsDialog: (state, action: PayloadAction<boolean>) => {
            state.showOptionsDialog = action.payload;
        },
    },
});

export const getGroupEvents = (state: RootState) => state.app.chart.groupEvents;
export const getInactivityThreshold = (state: RootState) =>
    state.app.chart.inactivityThreshold;
export const getMode = (state: RootState) => state.app.chart.mode;
export const getSelectedTime = (state: RootState) => state.app.chart.time;
export const getTraceEventFilter = (state: RootState) =>
    state.app.chart.traceEventFilter;
export const getLive = (state: RootState) => state.app.chart.live;
export const showOptionsDialog = (state: RootState) =>
    state.app.chart.showOptionsDialog;

export const {
    setSelectedTime,
    toggleMode,
    toggleGroupEvents,
    setInactivityThreshold,
    changeTraceEventFilter,
    setLive,
    setShowOptionsDialog,
} = slice.actions;
export default slice.reducer;
