/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Plugin } from 'chart.js';
import { colors } from 'pc-nrfconnect-shared';

export default {
    id: 'chartAreaColor',
    beforeDraw(chart) {
        const {
            ctx,
            chartArea: { left, top, width, height },
        } = chart;
        ctx.save();
        ctx.fillStyle = colors.gray700;
        ctx.fillRect(left, top, width, height);
        ctx.restore();
    },
} as Plugin<'scatter'>;
