/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Chart, Plugin } from 'chart.js';
// eslint-disable-next-line import/no-unresolved
import { AnyObject } from 'chart.js/types/basic';
import { colors } from 'pc-nrfconnect-shared';

let selectedTimeStamp = 0;
let pixelTime = -1;
let dragging = false;

export interface SelectTimeOptions extends AnyObject {
    updateTime: (time: number) => void;
}

export const selectTimePlugin: Plugin<'scatter', SelectTimeOptions> = {
    id: 'selectTime',

    afterInit(chart, args, options) {
        const { canvas } = chart.ctx;

        canvas.addEventListener('pointerdown', event => {
            if (event.ctrlKey) {
                // We are currently paning, don't change time
                return;
            }
            dragging = true;
            updateSelectedTime(event, chart, options);
        });

        canvas.addEventListener('pointermove', event => {
            if (dragging) {
                updateSelectedTime(event, chart, options);
            } else if (event.ctrlKey) {
                pixelTime = chart.scales.x.getPixelForValue(selectedTimeStamp);
                chart.update('none');
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
            ctx.strokeStyle = colors.gray900;
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
    options: SelectTimeOptions
) => {
    pixelTime = event.offsetX;
    selectedTimeStamp =
        chart.scales.x.getValueForPixel(pixelTime) ?? chart.scales.x.max;
    options.updateTime(selectedTimeStamp);
    chart.update('none');
};
