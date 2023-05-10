/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { ChartType } from 'chart.js';

import type { TraceEvent } from '../../tracing/tracePacketEvents';
import type { PanPluginOptions } from './state';

declare module 'chart.js' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface PluginOptionsByType<TType extends ChartType> {
        panZoom?: PanPluginOptions;
    }

    interface Chart {
        zoom: (resolution: number, centerOffset: number) => void;
        addData: (data: TraceEvent[]) => void;
        resetChart: () => void;
        setLive: (live: boolean) => void;
        setMode: (mode: 'Event' | 'Time') => void;
    }
}
