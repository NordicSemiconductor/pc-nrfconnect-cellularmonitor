/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { colors } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { Plugin } from 'chart.js';

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
