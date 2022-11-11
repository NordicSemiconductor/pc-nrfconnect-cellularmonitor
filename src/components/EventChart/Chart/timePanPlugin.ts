/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Plugin } from 'chart.js';
// eslint-disable-next-line import/no-unresolved
import { AnyObject } from 'chart.js/types/basic';

let referencePoint = 0;
let delta = 0;

export interface TimePanPluginOptions extends AnyObject {
    onPan: (
        scrollDir: 'left' | 'right',
        bounds: { min: number; max: number }
    ) => void;
}

let pointerDownHandler: (event: PointerEvent) => void;
const pointerUpHandler = () => {
    referencePoint = 0;
    delta = 0;
};
let pointerMoveHandler: (event: PointerEvent) => void;

export default {
    id: 'pan',

    beforeBuildTicks(chart) {
        if (!chart.scales.x.options.min || !chart.scales.x.options.max) {
            chart.scales.x.options.min = 0;
            chart.scales.x.options.max = 60000;
        }
    },

    afterInit(chart) {
        const { canvas } = chart.ctx;

        pointerDownHandler = event => {
            if (event.ctrlKey) {
                referencePoint =
                    chart.scales.x.getValueForPixel(event.offsetX) ?? 0;
            }
        };

        pointerMoveHandler = event => {
            if (referencePoint !== 0 && chart.options.plugins?.timePan?.onPan) {
                delta =
                    referencePoint -
                    (chart.scales.x.getValueForPixel(event.offsetX) ?? 0);

                if (chart.scales.x.options.min + delta < 0) {
                    if (chart.scales.x.options.min === 0) return;

                    chart.scales.x.options.max -= chart.scales.x.options.min;
                    chart.scales.x.options.min = 0;
                } else {
                    chart.scales.x.options.min += delta;
                    chart.scales.x.options.max += delta;
                }

                chart.options.plugins.timePan.onPan(
                    delta < 0 ? 'right' : 'left',
                    {
                        min: chart.scales.x.options.min,
                        max: chart.scales.x.options.max,
                    }
                );

                // if (reachedEnd) Show indicator at delta < 0 ? 'right' : 'left'

                referencePoint =
                    chart.scales.x.getValueForPixel(event.offsetX) ?? 0;
            }
        };

        canvas.addEventListener('pointerdown', pointerDownHandler);

        window.addEventListener('pointerup', pointerUpHandler);

        canvas.addEventListener('pointermove', pointerMoveHandler);
    },

    beforeDestroy(chart) {
        const { canvas } = chart.ctx;

        canvas.removeEventListener('pointerdown', pointerDownHandler);

        window.removeEventListener('pointerup', pointerUpHandler);

        canvas.removeEventListener('pointermove', pointerMoveHandler);
    },
} as Plugin<'scatter', TimePanPluginOptions>;
