/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Chart as ChartBase } from 'chart.js'; // Import the base Chart class

import type { TraceEvent } from '../../tracing/tracePacketEvents';

declare module 'chart.js' {
    interface Chart {
        zoom: (resolution: number, centerOffset: number) => void;
        addData: (data: TraceEvent[]) => void;
        resetChart: () => void;
        setLive: (live: boolean) => void;
        setMode: (mode: 'Event' | 'Time') => void;
    }
}

export type ChartWithZoom = ChartBase;
