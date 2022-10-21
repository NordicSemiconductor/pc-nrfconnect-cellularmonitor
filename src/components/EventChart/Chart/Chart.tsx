/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'chartjs-adapter-date-fns';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    CategoryScale,
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

import { colors as sharedColors, Toggle } from 'pc-nrfconnect-shared';
import { getSelectedTime, setSelectedTime } from './chartSlice';
import { selectTimePlugin } from './selectTimePlugin';
import { PacketTooltip } from './Tooltip';
import { Packet } from '../../../features/at';
import { getIsTracing } from '../../../features/tracing/traceSlice';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';

ChartJS.register(
    LinearScale,
    CategoryScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

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

const formats = [
    'at',
    'lte_rrc.bcch_dl_sch',
    'nas-eps',
    'lte_rrc.ul_ccch',
    'lte_rrc.dl_ccch',
    'lte_rrc.ul_dcch',
    'lte_rrc.dl_dcch',
    'ip',
];

export const Chart = ({ packets }: { packets: Packet[] }) => {
    const dispatch = useDispatch();
    const [xScaleType, setXScaleType] = useState<'time' | 'timeseries'>(
        'timeseries'
    );
    const chart = useRef<ChartJSOrUndefined<'scatter'>>();
    const isTracing = useSelector(getIsTracing);
    const selectedTime = useSelector(getSelectedTime);

    useEffect(() => {
        if (chart.current && isTracing) {
            chart.current.reset();
            chart.current.resetZoom();
        }
    }, [isTracing]);

    const options: ChartOptions<'scatter'> = useMemo(
        () => ({
            maintainAspectRatio: false,
            responsive: true,

            plugins: {
                legend: {
                    display: true,
                },

                zoom: {
                    
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        mode: 'x',
                    },
                    pan: {
                        enabled: true,
                        modifierKey: 'ctrl',
                        mode: 'x',
                    },
                },

                selectTime: {
                    updateTime(time) {
                        dispatch(setSelectedTime(time));
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

            scales: {
                y: {
                    display: true,
                    ticks: {
                        callback: () => undefined,
                    },
                    grid: { display: false },
                    suggestedMin: -1,
                    suggestedMax: formats.length,
                },
                x: {
                    type: xScaleType,
                    ticks: {
                        sampleSize: 50,
                        autoSkip: true,
                        autoSkipPadding: 50,
                        maxRotation: 0,
                    },

                },
            },
        }),
        [xScaleType]
    );

    const events = packets.map(event => ({
        x: (event.timestamp?.value ?? 0) / 1000,
        y: formats.indexOf(event.format) ?? 0,
        event,
    }));

    const datasets: typeof data.datasets = formats.map((format, index) => ({
        label: format,
        data: events.filter(event => event.event.format === format),
        borderColor: colors[index],
        backgroundColor: colors[index],
        pointRadius: 6,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 5,
        pointBorderWidth: 5,
        pointHoverBackgroundColor: 'white',
        hidden: format === 'modem_trace',
    }));

    const data: ChartData<'scatter'> = {
        datasets,
    };

    const plugins = [selectTimePlugin];
    return (
        <>
            <div
                className="d-flex flex-row justify-content-end"
                style={{ paddingRight: '0.5rem' }}
            >
                <Toggle
                    label="LIVE"
                    isToggled={chart.current?.isZoomedOrPanned()}
                    onToggle={() => {
                        chart.current?.resetZoom();
                    }}
                />
                <div style={{ width: '24px' }}></div>
                <Toggle
                    label="SERIAL"
                    isToggled={xScaleType === 'timeseries'}
                    onToggle={() =>
                        setXScaleType(
                            xScaleType === 'time' ? 'timeseries' : 'time'
                        )
                    }
                />
            </div>
            <div style={{ height: '200px' }}>
                <Scatter
                    ref={chart}
                    options={options}
                    data={data}
                    plugins={plugins}
                />
            </div>
        </>
    );
};
