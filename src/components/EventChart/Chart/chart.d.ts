/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ChartType } from 'chart.js';

declare module 'chart.js' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface PluginOptionsByType<TType extends ChartType> {
        eventPan: import('./eventPanPlugin').EventPanPluginOptions;
        timePan: import('./timePanPlugin').TimePanPluginOptions;
    }
}
