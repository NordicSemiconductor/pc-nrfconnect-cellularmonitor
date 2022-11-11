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
let restDelta = 0;

export interface EventPanPluginOptions extends AnyObject {
    onPan: (delta: number) => void;
}

let pointerDownHandler: (event: PointerEvent) => void;
const pointerUpHandler = () => {
    referencePoint = 0;
    delta = 0;
    restDelta = 0;
};
let pointerMoveHandler: (event: PointerEvent) => void;

export default {
    id: 'event-pan',

    afterInit(chart) {
        const { canvas } = chart.ctx;

        pointerDownHandler = event => {
            if (event.ctrlKey) {
                referencePoint =
                    chart.scales.x.getValueForPixel(event.offsetX) ?? 0;
            }
        };

        pointerMoveHandler = event => {
            if (
                referencePoint !== 0 &&
                chart.options.plugins?.eventPan?.onPan
            ) {
                delta =
                    referencePoint -
                    (chart.scales.x.getValueForPixel(event.offsetX) ?? 0);

                if (Math.abs(delta + restDelta) >= 1) {
                    const reachedEnd = chart.options.plugins.eventPan.onPan(
                        Math.floor(delta + restDelta)
                    );

                    restDelta =
                        delta + restDelta - Math.floor(delta + restDelta);
                    referencePoint =
                        chart.scales.x.getValueForPixel(event.offsetX) ?? 0;

                    // if (reachedEnd) Show indicator at delta < 0 ? 'right' : 'left'
                }
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
} as Plugin<'scatter', EventPanPluginOptions>;
