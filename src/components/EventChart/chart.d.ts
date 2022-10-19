/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ChartType } from 'chart.js';
import { AnyObject } from 'chart.js/types/basic';

interface DragSelectOptions extends AnyObject {
    updateTime: (time: number) => void;
}

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        dragSelectTime: DragSelectOptions;
    }
}
