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

import {
    TraceEvent,
    tracePacketEvents,
} from '../../../features/tracing/tracePacketEvents';
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
        typeof pointRadius === 'number' && pixelSize > 0
            ? pointRadius / pixelSize
            : 0;

    return percDiff * resolution;
};

const getMinMaxX = (chart: Chart) => {
    const { data, options } = getState(chart);

    if (data.length === 0) {
        return [
            defaultOptions(options.mode).currentRange.min,
            defaultOptions(options.mode).currentRange.max,
        ];
    }

    if (options.mode === 'Event') {
        const min = -getOffset(chart);
        return [
            min,
            Math.max(
                data.filter(e => options.traceEventFilter.includes(e.format))
                    .length -
                    1 +
                    getOffset(chart),
                min + options.resolution
            ),
        ];
    }

    const min =
        (data[0].timestamp ?? defaultOptions(options.mode).currentRange.min) -
        getOffset(chart);

    return [
        min,
        Math.max(options.maxRange + getOffset(chart), min + options.resolution),
    ];
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
    const { data, options } = getState(chart);
    const [min, max] = getMinMaxX(chart);

    const old = options.live;
    options.live = max <= range.max;

    if (old !== options.live) {
        options.onLiveChanged(options.live);
    }

    if (range.min < min || range.max > max) {
        range = getRange(chart);
    }

    // Event mode has to update delta display without updating slice
    // This is only relevant during the start when the range is bigger than data displayed
    if (options.mode === 'Event') {
        const filteredData = data.filter(event =>
            options.traceEventFilter.includes(event.format)
        );
        if (filteredData.length === 0) {
            options.onRangeChanged({ min: 0, max: 0 }, 0);
        } else {
            const maxTimestamp =
                filteredData[
                    Math.min(Math.floor(range.max), filteredData.length - 1)
                ].timestamp;

            options.onRangeChanged(
                {
                    min:
                        filteredData[Math.ceil(Math.max(range.min, 0))]
                            .timestamp - data[0].timestamp,
                    max: maxTimestamp - data[0].timestamp,
                },
                maxTimestamp
            );
        }
    }

    if (
        options.currentRange.max === range.max &&
        options.currentRange.min === range.min
    )
        return false;

    options.currentRange = { ...range };

    if (options.mode === 'Time') {
        options.onRangeChanged(
            { min: range.min - min, max: range.max - min },
            range.max
        );
    }

    (chart.scales.x.options as CartesianScaleOptions).min =
        options.currentRange.min;
    (chart.scales.x.options as CartesianScaleOptions).max =
        options.currentRange.max;

    return true;
};

const mutateData = (chart: Chart) => {
    const { data, options } = getState(chart);
    if (data.length === 0) return [];

    const filteredData = data.filter(event =>
        options.traceEventFilter.includes(event.format)
    );

    if (options.mode === 'Event') {
        const start = Math.floor(Math.max(options.currentRange.min, 0));

        return filteredData
            .slice(
                start,
                Math.min(
                    Math.ceil(options.currentRange.max) + 1,
                    filteredData.length
                )
            )
            .map(
                (event, index) =>
                    ({
                        x: start + index,
                        y: options.traceEventFilter.indexOf(event.format),
                        event,
                    } as ScatterDataPoint)
            );
    }

    const offset = getOffset(chart);

    return filteredData
        .filter(
            event =>
                event.timestamp >= options.currentRange.min - offset &&
                event.timestamp <= options.currentRange.max + offset
        )
        .map(
            event =>
                ({
                    x: event.timestamp,
                    y: options.traceEventFilter.indexOf(event.format),
                    event,
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

        if (options.mode === 'Time' && options.live) {
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

            const { data, options } = getState(chart);
            options.maxRange = data[data.length - 1].timestamp;
            updateRange(chart, getRange(chart));
            chart.update('none');
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
            // Mode needs to be preserved since setMode is only called on change
            const prevMode = getState(chart).options.mode;
            removeState(chart);
            initChart(chart);
            chart.setMode(prevMode);

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

                if (options.mode === 'Event') {
                    updateRange(chart, getRange(chart));
                    chart.update('none');
                } else if (
                    data[data.length - 1].timestamp >
                        options.maxRange + offset + liveInterval * 2 ||
                    data[data.length - 1].timestamp <
                        options.maxRange - liveInterval * 2
                ) {
                    const alpha = 0.3;

                    options.maxRange =
                        alpha * options.maxRange +
                        (1.0 - alpha) * data[data.length - 1].timestamp;
                }
            }
        };
        chart.setLive = live => {
            const { options } = getState(chart);

            options.live = live;
        };
        chart.setMode = mode => {
            const { data, options } = getState(chart);
            if (options.mode === mode) return;
            options.mode = mode;

            let max: number;
            options.resolution = defaultOptions(mode).resolution;
            options.resolutionLimits =
                (chart.options.plugins?.panZoom?.resolutionLimits as {
                    min: number;
                    max: number;
                }) ?? defaultOptions(mode).resolutionLimits;

            if (options.live || data.length === 0) {
                if (updateRange(chart, getRange(chart))) {
                    chart.update('none');
                }
                return;
            }

            const offset = getOffset(chart);
            const filteredData = data.filter(e =>
                options.traceEventFilter.includes(e.format)
            );
            if (mode === 'Event') {
                const refEvent = filteredData.findLast(
                    e => e.timestamp < options.currentRange.max
                );

                max = refEvent
                    ? filteredData.indexOf(refEvent) + offset
                    : defaultOptions(mode).currentRange.max;
            } else {
                max =
                    filteredData.length > 0
                        ? filteredData[
                              Math.min(
                                  Math.floor(options.currentRange.max),
                                  data.length - 1
                              )
                          ].timestamp + offset
                        : defaultOptions('Time').currentRange.max;
            }

            if (updateRange(chart, { min: max - options.resolution, max })) {
                chart.update('none');
            }
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
    beforeUpdate(chart) {
        // When changing the trace event filter the chart is partially reset
        // This clears the scales and leads to visual glitches
        if (chart.data.datasets[0].data.length <= 0) return;

        const options = chart.scales.x.options as CartesianScaleOptions;
        if (options.min === undefined || options.max === undefined) {
            const {
                data,
                options: {
                    live,
                    currentRange,
                    mode,
                    traceEventFilter,
                    resolution,
                },
            } = getState(chart);

            let newRange;

            if (live) {
                newRange = getRange(chart);
            } else if (mode === 'Event') {
                const timestampRef = (
                    chart.data.datasets[0].data[0] as unknown as {
                        event: TraceEvent;
                    }
                ).event.timestamp;

                const newFirstDataIndex = data
                    .filter(e => traceEventFilter.includes(e.format))
                    .findIndex(e => e.timestamp >= timestampRef);

                if (newFirstDataIndex === -1) newRange = { ...currentRange };
                else {
                    // Use modulo to avoid snapping data points into default position.
                    const min = newFirstDataIndex + (currentRange.min % 1);
                    newRange = {
                        min,
                        max: min + resolution,
                    };
                }
            } else {
                newRange = { ...currentRange };
            }

            if (!updateRange(chart, newRange)) {
                // Guarantee that range is valid and that scales have assigned values
                (chart.scales.x.options as CartesianScaleOptions).min =
                    newRange.min;
                (chart.scales.x.options as CartesianScaleOptions).max =
                    newRange.max;
            }
        }
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
