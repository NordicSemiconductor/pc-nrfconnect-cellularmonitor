/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import zoomPlugin from 'chartjs-plugin-zoom';
import { colors as sharedColors } from 'pc-nrfconnect-shared';

import { EVENT_TYPES } from '../../../features/tracing/formats';
import { getMode, getTraceEventFilter, setSelectedTime } from './chartSlice';
import eventPanPlugin from './eventPanPlugin';
import { PacketTooltip } from './Tooltip';
import useEventChartData from './useEventChartData';

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend, zoomPlugin);

const formatTicks = (mseconds: number) => {
    const rawDate = new Date(mseconds);
    const h = rawDate.getUTCHours().toString().padStart(2, '0');
    const m = rawDate.getUTCMinutes().toString().padStart(2, '0');
    const s = rawDate.getUTCSeconds().toString().padStart(2, '0');
    const time = `${h}:${m}:${s}`;
    const subsecond = `${Number(mseconds % 1e3).toFixed(3)}`.padStart(7, '0');
    return [time, subsecond];
};

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

export default () => {
    const dispatch = useDispatch();
    const chart = useRef<ChartJSOrUndefined<'scatter'>>();
    const traceEventFilter = useSelector(getTraceEventFilter);
    const mode = useSelector(getMode);
    const [bounds, setBounds] = useState({ min: -1, max: 80 });

    const updateChart = useCallback(() => {
        chart.current?.update();
    }, []);

    const [data, panDataEvent] = useEventChartData(bounds, updateChart);
    const datasets = useRef({
        datasets: [
            {
                data,
                pointBackgroundColor: (ctx: { raw: typeof data[number] }) => {
                    if (ctx.raw?.event)
                        return colors[
                            EVENT_TYPES.findIndex(
                                type => type === ctx.raw.event.format
                            )
                        ];
                },
                pointRadius: 6,
                pointHoverRadius: 6,
                pointHoverBorderWidth: 0,
                pointBorderWidth: 0,
                pointHoverBackgroundColor: 'white',
            },
        ],
    });

    const options: ChartOptions<'scatter'> = useMemo(
        () => ({
            animation: false,
            maintainAspectRatio: false,
            responsive: true,
            parsing: false,
            normalized: true,

            scales: {
                y: {
                    display: true,
                    ticks: {
                        callback: tickValue =>
                            tickValue >= 0 &&
                            Math.ceil(tickValue as number) === tickValue
                                ? traceEventFilter[tickValue]
                                : undefined,
                        stepSize: 0.5,
                    },
                    grid: {
                        display: true,
                        offset: true,
                        drawBorder: false,
                        drawTicks: false,
                    },
                    suggestedMin: -0.5,
                    suggestedMax: traceEventFilter.length - 0.5,
                },
                x: {
                    type: 'linear',
                    min: bounds.min,
                    max: bounds.max,
                    grid: {
                        drawBorder: false,
                        drawTicks: true,
                        display: true,
                        tickLength: 0,
                    },
                    ticks: {
                        maxRotation: 0,
                        display: true,
                        sampleSize: 2,
                        includeBounds: true,
                        maxTicksLimit: 2,
                        callback: (_, tickValue, ticks) => {
                            if (
                                tickValue === 0 ||
                                tickValue === ticks.length - 1
                            ) {
                                if (data.length < 2) {
                                    return formatTicks(0);
                                }

                                if (tickValue === 0) {
                                    return formatTicks(
                                        data[tickValue].event.timestamp
                                    );
                                }
                                if (tickValue === ticks.length - 1) {
                                    dispatch(
                                        setSelectedTime(
                                            data[data.length - 1].event
                                                .timestamp
                                        )
                                    );
                                    return formatTicks(
                                        data[data.length - 1].event.timestamp
                                    );
                                }
                            }
                            return undefined;
                        },
                    },
                },
            },

            plugins: {
                legend: {
                    display: false,
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        mode: 'x',
                    },
                },

                eventPan: {
                    onPan(delta: number) {
                        panDataEvent(delta);
                        dispatch(
                            setSelectedTime(
                                datasets.current.datasets[0].data.slice(-1)[0]
                                    .event.timestamp
                            )
                        );
                    },
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
        [dispatch, traceEventFilter, data, panDataEvent, bounds]
    );

    return (
        <div
            style={{
                height: `${30 + (170 / 7) * (traceEventFilter.length + 2)}px`,
            }}
        >
            <Scatter
                ref={chart}
                options={options}
                data={datasets.current as ChartData<'scatter'>}
                plugins={[eventPanPlugin]}
            />
        </div>
    );
};
