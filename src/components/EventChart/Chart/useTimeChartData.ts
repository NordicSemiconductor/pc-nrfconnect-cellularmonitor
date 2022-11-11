/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import {
    events,
    TraceEvent,
    tracePacketEvents,
} from '../../../features/tracing/tracePacketEvents';
import { getTraceEventFilter } from './chartSlice';

interface DataPoint {
    x: number;
    y: number;
    index: number;
    event: TraceEvent;
}

export default (chart: any, updateChart: () => void) => {
    const traceEventFilter = useSelector(getTraceEventFilter);

    const visibleData = useRef<DataPoint[]>([]);

    const eventToChartData = useCallback(
        (index: number) => ({
            x: events[index].timestamp,
            y: traceEventFilter.indexOf(events[index].format),
            index,
            event: events[index],
        }),
        [traceEventFilter]
    );

    const isWithinBounds = useCallback(
        (index: number, bounds: { min: number; max: number }) => {
            if (
                events[index].timestamp < bounds.min ||
                events[index].timestamp > bounds.max
            ) {
                return false;
            }
            return true;
        },
        []
    );

    const isVisibleEvent = useCallback(
        (index: number, bounds: { min: number; max: number }) => {
            if (!isWithinBounds(index, bounds)) return false;
            return traceEventFilter.includes(events[index].format);
        },
        [isWithinBounds, traceEventFilter]
    );

    const fillDataFromRight = useCallback(
        (
            bounds: { min: number; max: number },
            index = visibleData.current[visibleData.current.length - 1].index +
                1
        ) => {
            for (let i = index; i < events.length; i += 1) {
                if (isVisibleEvent(i, bounds)) {
                    visibleData.current.push(eventToChartData(i));
                }
            }
        },
        [isVisibleEvent, eventToChartData]
    );

    const fillDataFromLeft = useCallback(
        (
            bounds: { min: number; max: number },
            index = visibleData.current[0].index - 1
        ) => {
            for (let i = index; i >= 0; i -= 1) {
                if (isVisibleEvent(i, bounds)) {
                    visibleData.current.unshift(eventToChartData(i));
                }
            }
        },
        [isVisibleEvent, eventToChartData]
    );

    const panDataTime = useCallback(
        (panDir: 'left' | 'right', bounds: { min: number; max: number }) => {
            if (panDir === 'left') {
                const referenceIndex =
                    visibleData.current.length === 0
                        ? 0
                        : visibleData.current[visibleData.current.length - 1]
                              .index + 1;

                let removeCount = 0;
                for (let i = 0; i < visibleData.current.length; i += 1) {
                    if (!isWithinBounds(visibleData.current[i].index, bounds)) {
                        removeCount += 1;
                    } else {
                        break;
                    }
                }

                visibleData.current.splice(0, removeCount);

                fillDataFromRight(bounds, referenceIndex);
            } else {
                const referenceIndex =
                    visibleData.current.length === 0
                        ? events.length - 1
                        : visibleData.current[0].index - 1;

                let removeCount = 0;
                for (let i = visibleData.current.length - 1; i >= 0; i -= 1) {
                    if (!isWithinBounds(visibleData.current[i].index, bounds)) {
                        removeCount += 1;
                    } else {
                        break;
                    }
                }

                visibleData.current.splice(-removeCount, removeCount);

                fillDataFromLeft(bounds, referenceIndex);
            }
        },
        [isWithinBounds, fillDataFromLeft, fillDataFromRight]
    );

    const repopuplateData = useCallback(
        (bounds: { min: number; max: number }) => {
            if (events.length === 0) return;

            const referenceIndex =
                visibleData.current.length === 0
                    ? events.length - 1
                    : visibleData.current[visibleData.current.length - 1].index;

            visibleData.current.splice(0, visibleData.current.length);

            fillDataFromLeft(bounds, referenceIndex);

            fillDataFromRight(bounds, referenceIndex + 1);
        },
        [fillDataFromLeft, fillDataFromRight]
    );

    useEffect(() => {
        if (chart.current === undefined) return;

        const bounds = {
            min: chart.current.scales.x.min,
            max: chart.current.scales.x.max,
        };
        repopuplateData(bounds);
        updateChart();
    }, [chart, traceEventFilter, repopuplateData, updateChart]);

    useEffect(() => {
        const handler = (packets: unknown[]) => {
            if (chart.current === undefined) return;
            const bounds = {
                min: chart.current.scales.x.min,
                max: chart.current.scales.x.max,
            };

            fillDataFromRight(bounds, events.length - packets.length);

            updateChart();
        };

        tracePacketEvents.on('new-packets', handler);

        return () => {
            tracePacketEvents.removeListener('new-packets', handler);
        };
    }, [chart, fillDataFromRight, updateChart]);

    return [
        visibleData.current as DataPoint[],
        panDataTime,
        repopuplateData,
    ] as const;
};
