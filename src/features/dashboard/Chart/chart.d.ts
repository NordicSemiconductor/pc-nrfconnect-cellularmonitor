/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceEvent } from '../../../features/tracing/tracePacketEvents';
import { PanPluginOptions } from './state';

declare module 'chart.js' {
    interface PluginOptionsByType {
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
