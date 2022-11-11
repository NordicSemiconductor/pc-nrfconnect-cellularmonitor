/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
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

export default (
    bounds: { min: number; max: number },
    updateChart: () => void
) => {
    const traceEventFilter = useSelector(getTraceEventFilter);
    const chartSize = useMemo(() => bounds.max - bounds.min - 1, [bounds]);

    const visibleData = useRef<DataPoint[]>([]);

    const eventToChartData = useCallback(
        (index: number) => ({
            x: 0,
            y: traceEventFilter.indexOf(events[index].format),
            index,
            event: events[index],
        }),
        [traceEventFilter]
    );

    const updateAllXValues = useCallback(() => {
        visibleData.current.forEach((e, index) => {
            e.x = index;
        });
    }, []);

    const addNextDataPointFromRight = useCallback(() => {
        for (
            let i =
                visibleData.current[visibleData.current.length - 1].index + 1;
            i < events.length;
            i += 1
        ) {
            if (traceEventFilter.includes(events[i].format)) {
                visibleData.current.push(eventToChartData(i));
                return true;
            }
        }
        return false;
    }, [traceEventFilter, eventToChartData]);

    const addNextDataPointFromLeft = useCallback(
        (index = visibleData.current[0].index - 1) => {
            for (let i = index; i >= 0; i -= 1) {
                if (traceEventFilter.includes(events[i].format)) {
                    visibleData.current.unshift(eventToChartData(i));
                    return true;
                }
            }
            return false;
        },
        [traceEventFilter, eventToChartData]
    );

    const panData = useCallback(
        (delta: number) => {
            if (events.length >= chartSize) {
                if (delta > 0) {
                    for (let i = 0; i < Math.abs(delta); i += 1) {
                        if (!addNextDataPointFromRight()) {
                            break;
                        }
                    }
                    if (visibleData.current.length > chartSize) {
                        visibleData.current.splice(
                            0,
                            visibleData.current.length - chartSize
                        );
                    }
                } else {
                    for (let i = 0; i < Math.abs(delta); i += 1) {
                        if (!addNextDataPointFromLeft()) {
                            break;
                        }
                    }
                    if (visibleData.current.length > chartSize) {
                        visibleData.current.splice(
                            chartSize,
                            visibleData.current.length - chartSize
                        );
                    }
                }

                updateAllXValues();
                updateChart();
            }
        },
        [
            addNextDataPointFromLeft,
            addNextDataPointFromRight,
            updateAllXValues,
            updateChart,
            chartSize,
        ]
    );

    const repopuplateData = useCallback(() => {
        if (events.length === 0) return;

        // If all events were filtered out previously
        const referenceIndex =
            visibleData.current.length === 0
                ? events.length - 1
                : visibleData.current[visibleData.current.length - 1].index;

        visibleData.current.splice(0, visibleData.current.length);

        // Add initial entry for the following addNextDataPoint functions or return
        if (visibleData.current.length === 0) {
            if (!addNextDataPointFromLeft(referenceIndex)) {
                return;
            }
        }

        while (
            visibleData.current.length < chartSize &&
            addNextDataPointFromLeft()
        ) {
            // empty
        }

        while (
            visibleData.current.length < chartSize &&
            addNextDataPointFromRight()
        ) {
            // Empty
        }
    }, [chartSize, addNextDataPointFromLeft, addNextDataPointFromRight]);

    useEffect(() => {
        repopuplateData();
        updateAllXValues();
        updateChart();
    }, [
        chartSize,
        traceEventFilter,
        repopuplateData,
        updateAllXValues,
        updateChart,
    ]);

    useEffect(() => {
        const handler = () => {
            let didAddData = false;

            if (visibleData.current.length === 0) {
                for (let i = 0; i < events.length; i += 1) {
                    if (traceEventFilter.includes(events[i].format)) {
                        visibleData.current.push(eventToChartData(i));
                        didAddData = true;
                        break;
                    }
                }
            }

            while (visibleData.current.length < chartSize) {
                if (addNextDataPointFromRight()) {
                    didAddData = true;
                } else {
                    break;
                }
            }

            if (didAddData) {
                updateAllXValues();
                updateChart();
            }
        };

        tracePacketEvents.on('new-packets', handler);

        return () => {
            tracePacketEvents.removeListener('new-packets', handler);
        };
    }, [
        addNextDataPointFromRight,
        updateAllXValues,
        updateChart,
        chartSize,
        panData,
        eventToChartData,
        traceEventFilter,
    ]);

    return [visibleData.current as DataPoint[], panData] as const;
};
