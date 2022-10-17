import { Plugin } from 'chart.js';

import type { DragSelectOptions } from './plugin';

let selectedTimeStamp = 1665058976038;
let pixelTime = 0;
export const setTimeStamp = (time: number) => {
    selectedTimeStamp = time;
};

let dragging = false;

export const dragSelectTime: Plugin<'scatter', DragSelectOptions> = {
    id: 'dragSelectTime',

    beforeInit(chart, args, options) {
        const { canvas } = chart.ctx;

        canvas.addEventListener('pointerdown', event => {
            dragging = true;
        });
        canvas.addEventListener('pointermove', event => {
            if (dragging) {
                pixelTime = event.offsetX;
                chart.update('none');
                selectedTimeStamp =
                    chart.scales.x.getValueForPixel(pixelTime) ?? 0;
                options.updateTime(selectedTimeStamp);
            }
        });
        canvas.addEventListener('pointerup', () => {
            dragging = false;
        });
        canvas.addEventListener('pointerleave', () => {});
    },

    beforeDraw(chart) {
        const {
            chartArea: { top, bottom },
            ctx,
        } = chart;

        ctx.save();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#999999';

        ctx.beginPath();
        ctx.moveTo(pixelTime, top);
        ctx.lineTo(pixelTime, bottom);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    },
};
