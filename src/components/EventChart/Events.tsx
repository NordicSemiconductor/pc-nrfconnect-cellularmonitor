import 'chartjs-adapter-date-fns';

import React from 'react';
import { Scatter } from 'react-chartjs-2';
import ReactDOM from 'react-dom';
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

import { rawTraceData } from '../../../data/trace';
import { dragSelectTime } from './chart-plugins';
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

const now = Number(Date.now());
// const root = createRoot(document.getElementById('tooltip')!);

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

export const options: ChartOptions<'scatter'> = {
    maintainAspectRatio: false,
    responsive: false,

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
                mode: 'x',
            },
        },
        tooltip: {
            enabled: false,
            external(context) {
                const showing = context.tooltip.opacity === 1;
                if (showing) {
                    ReactDOM.render(
                        <Events />,
                        document.getElementById('tooltip')
                    );
                    // root.render(PacketTooltip(context.tooltip));
                } else {
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    ReactDOM.render(<></>, document.getElementById('tooltip'));
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
};

const events = traceEvents.map(event => ({
    x: event.timestamp.value,
    y: 0,
    event,
}));
const colors = [
    '#f44336',
    '#3f51b5',
    '#ffc107',
    '#9c27b0',
    '#4caf50',
    '#673ab7',
    '#ff9800',
    '#cddc39',
    '#e91e63',
];
const formats = traceEvents
    .reduce(
        (collector, event) => collector.add(event.format),
        new Set<string>()
    )
    .values();

const datasets: typeof data.datasets = [...formats].map((format, index) => ({
    label: format,
    data: events.filter(event => event.event.format === format),
    borderColor: colors[index],
    backgroundColor: colors[index],
    pointRadius: 10,
    pointHoverRadius: 12,
    hidden: format === 'modem_trace',
}));

export const data: ChartData<'scatter'> = {
    datasets,
};

const plugins = [dragSelectTime];

export const Events = () => (
    <Scatter
        height={200}
        width={1280}
        options={options}
        data={data}
        plugins={plugins}
    />
);
