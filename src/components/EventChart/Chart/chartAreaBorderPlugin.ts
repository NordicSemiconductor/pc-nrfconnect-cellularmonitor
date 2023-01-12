/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Plugin } from 'chart.js';

export default {
    id: 'chartAreaBorder',
    beforeDraw(chart) {
        const {
            ctx,
            chartArea: { left, top, width, height },
        } = chart;
        ctx.save();
        ctx.lineWidth = 0.05;
        ctx.strokeRect(left, top, width, height);
        ctx.restore();
    },
} as Plugin<'scatter'>;
