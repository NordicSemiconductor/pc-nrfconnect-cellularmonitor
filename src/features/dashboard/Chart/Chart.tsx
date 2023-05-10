/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
// eslint-disable-next-line import/no-unresolved
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
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

import { EventColours } from '../../tracing/formats';
import { TraceEvent, tracePacketEvents } from '../../tracing/tracePacketEvents';
import chartAreaColorPlugin from './chartAreaColorPlugin';
import {
    getLive,
    getMode,
    getTraceEventFilter,
    setLive,
    setSelectedTime,
} from './chartSlice';
import ChartTop from './ChartTop';
import panZoomPlugin from './panZoomPlugin';
import { defaultOptions } from './state';
import TimeSpanDeltaLine from './TimeSpanDeltaLine';
import { tooltipHandler } from './Tooltip';

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);

const datasets = {
    datasets: [
        {
            data: [],
            pointBackgroundColor: (ctx: { raw: { event: TraceEvent } }) =>
                ctx.raw?.event
                    ? EventColours[ctx.raw.event.format].light
                    : undefined,
            pointRadius: 4.5,
            pointHoverRadius: 4.5,
            pointHoverBorderWidth: 0,
            pointBorderWidth: 0,
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
            layout: {
                autoPadding: false,
            },

            scales: {
                y: {
                    ticks: {
                        padding: 10,
                        color: sharedColors.gray700,
                        font: {
                            size: 10,
                            lineHeight: 1,
                        },
                        backdropPadding: 0,
                        callback: tickValue =>
                            (tickValue as number) >= 0 &&
                            Math.ceil(tickValue as number) === tickValue
                                ? traceEventFilter[tickValue]
                                : undefined,
                        stepSize: 0.5,
                    },
                    afterFit: scale => {
                        scale.paddingTop = 0;
                        scale.paddingBottom = 0;
                    },
                    reverse: true,
                    grid: {
                        display: true,
                        offset: true,
                        color: sharedColors.gray200,
                        drawTicks: false,
                        lineWidth: 1,
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
                        scale.paddingRight = 0;
                    },
                    grid: {
                        display: false,
                        tickLength: 0,
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
                        tooltipHandler(context);
                    },
                },
            },
        }),
        [dispatch, traceEventFilter]
    );

    const sectionHeight = 13;
    const sectionSeperatorHeight = 1;
    const chartHeight =
        sectionHeight * traceEventFilter.length +
        sectionSeperatorHeight * (traceEventFilter.length - 1);

    return (
        <>
            <ChartTop marginLeft={chart.current?.chartArea.left ?? 0} />
            <div
                className="chart-data"
                style={{
                    height: `${chartHeight}px`,
                }}
            >
                <Scatter
                    ref={chart}
                    options={options}
                    data={datasets as ChartData<'scatter'>}
                    plugins={[panZoomPlugin, chartAreaColorPlugin]}
                />
            </div>
            <TimeSpanDeltaLine range={range} chartArea={chartArea} />
        </>
    );
};
