/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'chartjs-adapter-date-fns';

import React, { useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
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

import { colors as sharedColors } from "pc-nrfconnect-shared";
import { rawTraceData } from '../../../data/trace';
import { setSelectedTime } from './chart.slice';
import { dragSelectTime } from './chart.plugin.dragSelectTIme';
import { PacketTooltip } from './Tooltip';

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

// Parse modem data from file to sample inputs. Set fake timetamp
const decoder = new TextDecoder();
const traceEvents = rawTraceData
    .filter(packet => packet.format !== 'modem_trace')
    .map(packet => ({
        ...packet,
        packet_data: JSON.stringify(
            decoder.decode(new Uint8Array(packet.packet_data.data))
        ),
        timestamp: { value: packet.timestamp.value / 1000 },
    }));

const formats = [...traceEvents
    .reduce(
        (collector, event) => collector.add(event.format),
        new Set<string>()
    )
    .values()];

const events = traceEvents.map(event => ({
    x: event.timestamp.value,
    y: formats.indexOf(event.format),
    event,
}));

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

export const data: ChartData<'scatter'> = {
    datasets,
};

export const Events = () => {
    const dispatch = useDispatch();

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

                dragSelectTime: {
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
                    suggestedMax: formats.length
                },
                x: {
                    type: 'time',
                    ticks: {
                        sampleSize: 50,
                        autoSkip: true,
                        autoSkipPadding: 50,
                        maxRotation: 0,
                    },
                },
            },
        }),
        []
    );

    const plugins = [dragSelectTime];

    return (
        <Scatter
            options={options}
            data={data}
            plugins={plugins}
        />
    );
};
