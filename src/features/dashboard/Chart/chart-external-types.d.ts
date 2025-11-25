/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { ChartType } from 'chart.js';

type LocalPanPluginOptions = {
    enabled?: boolean;
    mode?: 'x' | 'y' | 'xy';
    scaleMode?: 'all' | 'x' | 'y';
    limits?: Record<string, any>;
    resolutionLimits: {
        min: number;
        max: number;
    };
};

declare module 'chart.js' {
    interface PluginOptionsByType<_TType extends ChartType> {
        panZoom?: LocalPanPluginOptions;
    }
}

export {};
