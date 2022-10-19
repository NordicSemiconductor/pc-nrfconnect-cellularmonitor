/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Chart, Plugin } from 'chart.js';

import type { DragSelectOptions } from './plugin';

let selectedTimeStamp = 0;
let pixelTime = -1;
let dragging = false;

export const dragSelectTime: Plugin<'scatter', DragSelectOptions> = {
    id: 'dragSelectTime',

    afterInit(chart, args, options) {
        const { canvas } = chart.ctx;

        canvas.addEventListener('pointerdown', event => {
            dragging = true;
            updateSelectedTime(event, chart, options);
        });

        canvas.addEventListener('pointermove', event => {
            if (dragging) {
                updateSelectedTime(event, chart, options);
            }
        });

        canvas.addEventListener('pointerup', () => {
            dragging = false;
        });

        canvas.addEventListener('pointerleave', () => {
            dragging = false;
        });
    },

    beforeDraw(chart) {
        const {
            chartArea: { top, bottom },
            ctx,
        } = chart;

        if (pixelTime >= 0) {
            ctx.save();

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#263238';

            ctx.beginPath();
            ctx.moveTo(pixelTime, top);
            ctx.lineTo(pixelTime, bottom);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        }
    },
};

const updateSelectedTime = (
    event: PointerEvent,
    chart: Chart,
    options: DragSelectOptions
) => {
    pixelTime = event.offsetX;
    selectedTimeStamp =
        chart.scales.x.getValueForPixel(pixelTime) ?? chart.scales.x.max;
    options.updateTime(selectedTimeStamp);
    chart.update('none');
};
