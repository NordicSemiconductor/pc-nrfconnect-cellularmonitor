/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChartType, ChartTypeRegistry } from 'chart.js';

import { TraceEvent } from '../../../features/tracing/tracePacketEvents';
import { PanPluginOptions } from './state';

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        panZoom?: PanPluginOptions;
    }

    interface Chart<
        TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry
    > {
        zoom: (resolution: number, centerOffset: number) => void;
        addData: (data: TraceEvent[]) => void;
        resetChart: () => void;
        setLive: (live: boolean) => void;
        setMode: (mode: 'Event' | 'Time') => void;
    }
}
