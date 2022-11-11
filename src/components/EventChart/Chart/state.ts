/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Chart } from 'chart.js';
// eslint-disable-next-line import/no-unresolved
import { AnyObject } from 'chart.js/dist/types/basic';

import { eventType } from '../../../features/tracing/formats';
import { TraceEvent } from '../../../features/tracing/tracePacketEvents';

export interface XAxisRange {
    min: number;
    max: number;
}

export interface PanPluginOptions extends AnyObject {
    minResolution?: number;
    zoomFactor?: number;
    traceEventFilter: eventType[];
    onLiveChanged?: (live: boolean) => void;
    onRangeChanged?: (range: XAxisRange) => void;
}

export type InternalPanPluginOptions = Required<PanPluginOptions> & {
    live: boolean;
    resolution: number;
    currentRange: XAxisRange;
};

interface ChartState {
    options: InternalPanPluginOptions;
    data: TraceEvent[];
}

const chartStates = new WeakMap<Chart, ChartState>();

export const defaultOptions = () => ({
    live: true,
    resolution: 20000,
    minResolution: 1000,
    zoomFactor: 1.1,
    currentRange: { min: 0, max: 20000 },
    traceEventFilter: [],
    onLiveChanged: () => {},
    onRangeChanged: () => {},
});

export const getState = (chart: Chart) => {
    let state = chartStates.get(chart);

    if (!state) {
        state = {
            options: defaultOptions(),
            data: [],
        };
        chartStates.set(chart, state);
    }

    // Object assign to preserve the reference
    Object.assign(state.options, {
        ...chart.options.plugins?.panZoom,
    });
    return state;
};

export const removeState = (chart: Chart) => {
    chartStates.delete(chart);
};
