import { Plugin } from 'chart.js';

let selectedTimeStamp = 1665058976038;
export const setTimeStamp = (time: number) => (selectedTimeStamp = time);

export const dragSelectTime: Plugin = {
    id: 'dragSelectTime',

    beforeInit(chart, args, options) {
        const { canvas } = chart.ctx;
        console.log('initing');

        canvas.addEventListener('pointerdown', event => {
            console.log(event);
        });
        canvas.addEventListener('pointermove', () => {});
        canvas.addEventListener('pointerup', () => {});
        canvas.addEventListener('pointerleave', () => {});
    },

    beforeDraw(chart, args, options) {
        const {
            chartArea: { left, right, top, bottom },
            scales: { x: timescale },
            ctx,
        } = chart;

        const sX =
            Math.ceil(timescale.getPixelForValue(selectedTimeStamp) - 0.5) -
            0.5;

        ctx.save();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#999999';

        if (true) {
            // in bounds
            ctx.beginPath();
            ctx.moveTo(sX, top);
            ctx.lineTo(sX, bottom);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    },
};
