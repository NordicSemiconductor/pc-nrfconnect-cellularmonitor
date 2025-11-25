/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Chart } from 'chart.js';
// eslint-disable-next-line import/no-unresolved
import { AnyObject } from 'chart.js/dist/types/basic';

import { eventType } from '../../tracing/formats';
import { TraceEvent } from '../../tracing/tracePacketEvents';

export interface XAxisRange {
    min: number;
    max: number;
}

interface ResolutionLimits {
    min: number;
    max: number;
}
export interface PanPluginOptions extends AnyObject {
    resolutionLimits?: Partial<ResolutionLimits>;
    zoomFactor?: number;
    traceEventFilter: eventType[];
    onLiveChanged?: (live: boolean) => void;
    onRangeChanged?: (
        relativeRange: XAxisRange,
        referenceNrfmlTimestamp: number,
    ) => void;
}

export type InternalPanPluginOptions = Required<PanPluginOptions> & {
    resolutionLimits: ResolutionLimits;
    live: boolean;
    resolution: number;
    maxRange: number;
    currentRange: XAxisRange;
    mode: 'Event' | 'Time';
};

interface ChartState {
    options: InternalPanPluginOptions;
    data: TraceEvent[];
}

const chartStates = new WeakMap<Chart, ChartState>();

export const defaultOptions = (mode: 'Event' | 'Time') => ({
    live: true,
    resolution: mode === 'Event' ? 80 : 20000,
    resolutionLimits:
        mode === 'Event'
            ? { min: 20, max: 160 }
            : {
                  min: 1000,
                  // One day in ms
                  max: 86400000,
              },
    zoomFactor: 1.1,
    maxRange: 0,
    currentRange: { min: 0, max: 0 },
    traceEventFilter: [],
    onLiveChanged: () => {},
    onRangeChanged: () => {},
    mode,
});

export const getState = (chart: Chart) => {
    let state = chartStates.get(chart);

    if (!state) {
        state = {
            options: defaultOptions('Event'),
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
