/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    CartesianScaleOptions,
    Chart,
    ChartDataset,
    Plugin,
    ScatterDataPoint,
} from 'chart.js';

import { tracePacketEvents } from '../../../features/tracing/tracePacketEvents';
import {
    defaultOptions,
    getState,
    PanPluginOptions,
    removeState,
    XAxisRange,
} from './state';

declare global {
    interface Array<T> {
        reverseMap<R>(callback?: (item: T) => R): R[];
        findLast(callback: (item: T) => boolean): T | undefined;
    }
}
if (!Array.prototype.reverseMap) {
    // eslint-disable-next-line no-extend-native
    Array.prototype.reverseMap = function reverseMap<T, R>(
        this: T[],
        callback?: (item: T) => R
    ) {
        const arr: R[] = [];
        if (!callback) return arr;

        for (let i = this.length - 1; i >= 0; i -= 1) {
            arr.unshift(callback(this[i]));
        }

        return arr;
    };
    // eslint-disable-next-line no-extend-native
    Array.prototype.findLast = function findLast<T>(
        this: T[],
        callback: (item: T) => boolean
    ) {
        for (let i = this.length - 1; i >= 0; i -= 1) {
            if (callback(this[i])) return this[i];
        }
        return undefined;
    };
}
const initRange = (chart: Chart) => {
    const { options, data } = getState(chart);
    if (data.length > 0) {
        options.currentRange = getRange(chart);
    }
};

const getOffset = (chart: Chart) => {
    const { resolution } = getState(chart).options;
    const pointRadius = (chart.data.datasets[0] as ChartDataset<'scatter'>)
        .pointRadius;

    const pixelSize = chart.chartArea.right - chart.chartArea.left;
    const percDiff =
        (typeof pointRadius === 'number' ? pointRadius : 0) / pixelSize;

    return percDiff * resolution;
};

const getMinMaxX = (chart: Chart) => {
    const { data, options } = getState(chart);

    if (data.length === 0) {
        return [
            defaultOptions().currentRange.min,
            defaultOptions().currentRange.max,
        ];
    }

    // const offset = getOffset(chart);

    const min = data[0].timestamp ?? defaultOptions().currentRange.min;
    // const maxTimestamp =
    //     data.findLast(e => traceEventFilter.includes(e.format))?.timestamp ??
    //     defaultOptions().currentRange.max;
    // const max = Math.max(maxTimestamp + offset, maxRange);

    return [min, Math.max(options.maxRange, min + options.resolution)];
};

// Calulate Range from Data Backup
const getRange = (chart: Chart) => {
    const { options } = getState(chart);
    const [min, max] = getMinMaxX(chart);

    if (options.live) {
        return {
            min: Math.max(min, max - options.resolution),
            max,
        };
    }

    return {
        min,
        max: Math.min(max, min + options.resolution),
    };
};

const updateRange = (chart: Chart, range: XAxisRange) => {
    const { options } = getState(chart);
    const [min, max] = getMinMaxX(chart);

    const old = options.live;
    options.live = max <= range.max;

    if (old !== options.live) {
        options.onLiveChanged(options.live);
    }

    if (range.min < min || range.max > max) {
        range = getRange(chart);
    }

    if (
        options.currentRange.max === range.max &&
        options.currentRange.min === range.min
    )
        return false;

    options.currentRange = { ...range };
    options.onRangeChanged({ min: range.min - min, max: range.max - min });

    (chart.scales.x.options as CartesianScaleOptions).min =
        options.currentRange.min;
    (chart.scales.x.options as CartesianScaleOptions).max =
        options.currentRange.max;

    return true;
};

const mutateData = (chart: Chart) => {
    const { data, options } = getState(chart);
    if (data.length === 0) return [];

    const offset = getOffset(chart);

    return data
        .filter(
            packet =>
                options.traceEventFilter.includes(packet.format) &&
                packet.timestamp >= options.currentRange.min - offset &&
                packet.timestamp <= options.currentRange.max + offset
        )
        .map(
            packet =>
                ({
                    x: packet.timestamp,
                    y: options.traceEventFilter.indexOf(packet.format),
                    event: packet,
                } as ScatterDataPoint)
        );
};

const isInChartArea = (chart: Chart, x: number, y: number) => {
    const ca = chart.chartArea;
    return x >= ca.left && x <= ca.right && y >= ca.top && y <= ca.bottom;
};

const initChart = (chart: Chart) => {
    const { options, data } = getState(chart);

    data.splice(0);
    options.onLiveChanged(options.live);
};

const liveInterval = 30;
let liveIntervalId: NodeJS.Timeout | undefined;

const setupLiveInterval = (chart: Chart) => {
    if (liveIntervalId) return;

    liveIntervalId = setInterval(() => {
        const { options } = getState(chart);

        options.maxRange = Date.now();

        if (options.live) {
            updateRange(chart, getRange(chart));
            chart.update('none');
        }
    }, 30);
};

export default {
    id: 'panZoom',
    start(chart: Chart) {
        initChart(chart);
        tracePacketEvents.on('stop-process', () => {
            if (liveIntervalId) {
                clearInterval(liveIntervalId);
                liveIntervalId = undefined;
            }
        });
        chart.zoom = (resolution, offset) => {
            const { options } = getState(chart);
            // Necessary as options.resolution is not correct during the very start.
            const currentResolution =
                options.currentRange.max - options.currentRange.min;
            const resolutonDelta = resolution - currentResolution;
            options.resolution = resolution;

            const deltaMin = resolutonDelta * offset;
            const deltaMax = resolutonDelta - deltaMin;

            const nextRange = {
                min: options.currentRange.min - deltaMin,
                max: options.currentRange.max + deltaMax,
            };

            if (updateRange(chart, nextRange)) {
                chart.update('none');
            }
        };
        chart.resetChart = () => {
            removeState(chart);
            initChart(chart);

            const { options } = getState(chart);
            (chart.scales.x.options as CartesianScaleOptions).min =
                options.currentRange.min;
            (chart.scales.x.options as CartesianScaleOptions).max =
                options.currentRange.max;

            chart.update('none');
        };
        chart.addData = newData => {
            if (newData.length === 0) return;
            if (!liveIntervalId) setupLiveInterval(chart);

            const { options, data } = getState(chart);
            data.push(...newData);

            if (options.live) {
                const offset = getOffset(chart);

                // There is some device delay (~250ms) which is being synced here.
                // With the smoothing formula there appear to be no choppy updates
                if (
                    data[data.length - 1].timestamp >
                        options.maxRange + offset + liveInterval * 2 ||
                    data[data.length - 1].timestamp <
                        options.maxRange - liveInterval * 2
                ) {
                    const alpha = 0.3;

                    options.maxRange =
                        alpha * options.maxRange +
                        (1.0 - alpha) *
                            (data[data.length - 1].timestamp +
                                getOffset(chart));
                }

                // if (updateRange(chart, getRange(chart))) {
                //     chart.update('none');
                // }
            }
        };
        chart.setLive = live => {
            const { options } = getState(chart);
            // if (options.live === live) return;

            options.live = live;

            // if (live && !liveInterval) {
            //     setupLiveInterval(chart);
            //     // setLiveInterval that calls mutatedata(chart) and chart.update('none') ?
            //     // if (updateRange(chart, getRange(chart))) {
            //     //     chart.update('none');
            //     // }
            // } else {
            //     clearInterval(liveInterval);
            // }
        };
    },
    afterInit(chart) {
        initRange(chart);

        const { canvas } = chart.ctx;

        let lastX = 0;
        let newX = 0;
        let panning = false;

        // Running avarage to smoth Scroll
        const alpha = 0.3;

        canvas.addEventListener('pointerdown', (event: PointerEvent) => {
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            lastX = event.offsetX - chart.chartArea.left;
            newX = lastX;

            panning = true;
        });

        window.addEventListener('pointerup', () => {
            panning = false;
        });

        canvas.addEventListener('pointermove', (event: PointerEvent) => {
            if (!panning) return;
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            const { options } = getState(chart);

            const currentNewX = event.offsetX - chart.chartArea.left;

            // Running avarage to smoth scrolls
            newX = alpha * currentNewX + (1.0 - alpha) * newX;

            const scaleDiff = lastX - newX;

            if (Math.abs(scaleDiff) < 1) return;

            const scaleDiffPercent = scaleDiff / chart.chartArea.width;
            const delta = options.resolution * scaleDiffPercent;

            const nextRange = {
                max: options.currentRange.max + delta,
                min: options.currentRange.max - options.resolution + delta,
            };

            lastX = newX;

            if (updateRange(chart, nextRange)) {
                chart.update('none');
            }
        });

        canvas.addEventListener('wheel', (event: WheelEvent) => {
            if (event.deltaY === 0) return;
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;
            const { options } = getState(chart);

            let newResolution =
                event.deltaY < 0
                    ? options.resolution / options.zoomFactor // Zoom In
                    : options.resolution * options.zoomFactor; // Zoom out

            const [min, max] = getMinMaxX(chart);
            const maxResolution = Math.min(
                max - min,
                options.resolutionLimits.max
            );

            newResolution = Math.ceil(
                Math.max(
                    options.resolutionLimits.min,
                    Math.min(newResolution, maxResolution)
                )
            );

            // Zoom where the mouse pointer is
            const offset =
                (event.offsetX - chart.chartArea.left) / chart.chartArea.width;
            chart.zoom(newResolution, offset);
        });
    },
    beforeElementsUpdate(chart) {
        chart.data.datasets[0].data = mutateData(chart);
    },
    stop(chart) {
        if (liveIntervalId) {
            clearInterval(liveIntervalId);
            liveIntervalId = undefined;
        }
        removeState(chart);
    },
} as Plugin<'scatter', PanPluginOptions>;
