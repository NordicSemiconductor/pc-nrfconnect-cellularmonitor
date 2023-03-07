/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
// eslint-disable-next-line import/no-unresolved
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Legend,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { colors as sharedColors } from 'pc-nrfconnect-shared';

import { EVENT_TYPES } from '../../../features/tracing/formats';
import {
    TraceEvent,
    tracePacketEvents,
} from '../../../features/tracing/tracePacketEvents';
import chartAreaBorderPlugin from './chartAreaBorderPlugin';
import {
    getLive,
    getMode,
    getTraceEventFilter,
    setLive,
    setSelectedTime,
} from './chartSlice';
import panZoomPlugin from './panZoomPlugin';
import { defaultOptions } from './state';
import TimeSpanDeltaLine from './TimeSpanDeltaLine';
import { PacketTooltip } from './Tooltip';

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);

const colors = [
    sharedColors.primary,
    sharedColors.deepPurple,
    sharedColors.indigo,
    sharedColors.amber,
    sharedColors.purple,
    sharedColors.green,
    sharedColors.deepPurple,
    sharedColors.orange,
    sharedColors.lime,
    sharedColors.pink,
];

const datasets = {
    datasets: [
        {
            data: [],
            pointBackgroundColor: (ctx: { raw: { event: TraceEvent } }) =>
                ctx.raw?.event
                    ? colors[
                          EVENT_TYPES.findIndex(
                              type => type === ctx.raw.event.format
                          )
                      ]
                    : undefined,
            pointRadius: 6,
            pointHoverRadius: 6,
            pointHoverBorderWidth: 0,
            pointBorderWidth: 0,
            pointHoverBackgroundColor: 'white',
        },
    ],
};

export default () => {
    const dispatch = useDispatch();
    const chart = useRef<ChartJSOrUndefined<'scatter'>>();
    const traceEventFilter = useSelector(getTraceEventFilter);
    const isLive = useSelector(getLive);
    const mode = useSelector(getMode);
    const [range, setRange] = useState(defaultOptions(mode).currentRange);
    const [chartArea, setChartCanvas] = useState(chart.current?.chartArea);

    useEffect(() => {
        const handler = (packets: TraceEvent[]) => {
            chart.current?.addData(packets);
        };

        tracePacketEvents.on('new-packets', handler);

        return () => {
            tracePacketEvents.removeListener('new-packets', handler);
        };
    }, []);

    useEffect(() => {
        const handler = () => {
            chart.current?.resetChart();
        };

        tracePacketEvents.on('start-process', handler);

        return () => {
            tracePacketEvents.removeListener('start-process', handler);
        };
    }, []);

    useEffect(() => {
        chart.current?.setLive(isLive);
    }, [isLive]);

    useEffect(() => {
        chart.current?.setMode(mode);
    }, [mode]);

    const options: ChartOptions<'scatter'> = useMemo(
        () => ({
            animation: false,
            maintainAspectRatio: false,
            responsive: true,
            parsing: false,
            normalized: true,
            onResize: c => {
                setTimeout(() => setChartCanvas(c.chartArea));
            },

            scales: {
                y: {
                    ticks: {
                        callback: tickValue =>
                            (tickValue as number) >= 0 &&
                            Math.ceil(tickValue as number) === tickValue
                                ? traceEventFilter[tickValue]
                                : undefined,
                        stepSize: 0.5,
                    },
                    reverse: true,
                    grid: {
                        display: true,
                        offset: true,
                        drawTicks: false,
                        lineWidth: tick => {
                            // remove top and bottom offset gridline to avoid overlap with chartAreaBorderPlugin
                            if (
                                // Chartjs has incorrect typings
                                (tick as unknown as { type: string }).type ===
                                    'scale' ||
                                tick.index === 0
                            )
                                return 0;
                            return 1;
                        },
                    },
                    border: {
                        display: false,
                    },
                    suggestedMin: -0.5,
                    suggestedMax: traceEventFilter.length - 0.5,
                },
                x: {
                    type: 'linear',
                    afterFit: scale => {
                        scale.paddingRight = 16;
                    },
                    grid: {
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                    ticks: {
                        display: false,
                    },
                },
            },

            plugins: {
                legend: {
                    display: false,
                },

                panZoom: {
                    onLiveChanged: live => dispatch(setLive(live)),
                    onRangeChanged: (
                        relativeRange,
                        referenceNrfmlTimestamp
                    ) => {
                        dispatch(setSelectedTime(referenceNrfmlTimestamp));
                        setRange(relativeRange);
                    },
                    traceEventFilter,
                },

                tooltip: {
                    enabled: false,
                    external(context) {
                        const showing = context.tooltip.opacity === 1;

                        if (showing) {
                            const tooltip = PacketTooltip(context.tooltip);
                            if (tooltip) {
                                ReactDOM.render(
                                    tooltip,
                                    document.getElementById('tooltip')
                                );
                            }
                        } else {
                            ReactDOM.render(
                                <div />,
                                document.getElementById('tooltip')
                            );
                        }
                    },
                },
            },
        }),
        [dispatch, traceEventFilter]
    );

    const chartTopBottomOffset = 30.4;
    const sectionHeight = 24;

    return (
        <>
            <div
                style={{
                    height: `${
                        chartTopBottomOffset +
                        traceEventFilter.length * sectionHeight
                    }px`,
                }}
            >
                <Scatter
                    ref={chart}
                    options={options}
                    data={datasets as ChartData<'scatter'>}
                    plugins={[panZoomPlugin, chartAreaBorderPlugin]}
                />
            </div>
            <TimeSpanDeltaLine range={range} chartArea={chartArea} />
        </>
    );
};
