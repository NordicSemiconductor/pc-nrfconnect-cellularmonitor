/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BubbleDataPoint,
    Chart,
    ChartDataset,
    ChartTypeRegistry,
    Point,
    TooltipModel,
} from 'chart.js';

import { TraceEvent } from '../../../features/tracing/tracePacketEvents';

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // @ts-expect-error This is working in our version of the browser
    fractionalSecondDigits: 3,
});

const getOrCreateTooltip = (
    chart: Chart<
        keyof ChartTypeRegistry,
        (number | Point | [number, number] | BubbleDataPoint | null)[],
        unknown
    >,
    tooltip: TooltipModel<'scatter'>
) => {
    let tooltipEl = chart.canvas.parentNode?.querySelector('div');

    if (!tooltipEl && chart.canvas.parentNode) {
        tooltipEl = document.createElement('div');
        tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
        tooltipEl.style.borderRadius = '3px';
        tooltipEl.style.color = 'white';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.transition = 'all .1s ease';

        chart.canvas.parentNode.appendChild(tooltipEl);

        const observer = new MutationObserver(() => {
            if (!tooltipEl || tooltipEl.style.opacity !== '1') return;

            tooltipEl.style.left = `${
                Math.min(
                    Math.max(
                        tooltip.caretX - tooltipEl.offsetWidth / 2,
                        chart.chartArea.left
                    ),
                    chart.chartArea.right - tooltipEl.offsetWidth
                ) + chart.canvas.offsetLeft
            }px`;

            const pointRadius = (
                chart.data.datasets[0] as ChartDataset<'scatter'>
            ).pointRadius as number;

            tooltipEl.style.top = `${
                tooltip.caretY +
                chart.canvas.offsetTop -
                tooltipEl.clientHeight -
                pointRadius
            }px`;
        });
        observer.observe(tooltipEl, {
            childList: true,
        });
    }

    return tooltipEl;
};

export const tooltipHandler = (context: {
    chart: Chart<
        keyof ChartTypeRegistry,
        (number | Point | [number, number] | BubbleDataPoint | null)[],
        unknown
    >;
    tooltip: TooltipModel<'scatter'>;
}) => {
    const { chart, tooltip } = context;
    const { dataPoints } = tooltip;
    const tooltipEl = getOrCreateTooltip(chart, tooltip);

    if (!tooltipEl) return;

    if (tooltip.opacity === 0 || !dataPoints[0]) {
        tooltipEl.style.opacity = '0';
        return;
    }

    const packet = (dataPoints[0].raw as { event: TraceEvent }).event;
    const timestamp = dateFormatter.format(new Date(packet.timestamp));

    const children = [];
    if (tooltip.body) {
        const hoveringMultiple =
            dataPoints.length === 1 ? '' : `+${dataPoints.length - 1} others`;
        if (hoveringMultiple) {
            const multipleDiv = document.createElement('div');
            const multipleSpan = document.createElement('span');
            const multipleText = document.createTextNode(hoveringMultiple);
            multipleSpan.appendChild(multipleText);
            multipleDiv.appendChild(multipleSpan);
            children.push(multipleDiv);
        }

        if (
            dataPoints.length === 1 &&
            (packet.format === 'AT' || packet.jsonData)
        ) {
            const p = document.createElement('p');

            const data =
                packet.format === 'AT'
                    ? packet.data.toString()
                    : 'Parsed data here';
            const textP = document.createTextNode(data as string);
            p.appendChild(textP);
            children.push(p);
        }

        const timestampSpan = document.createElement('span');
        const timestampText = document.createTextNode(timestamp);
        timestampSpan.appendChild(timestampText);
        children.push(timestampSpan);
    }

    while (tooltipEl.firstChild) {
        tooltipEl.firstChild.remove();
    }

    children.forEach(e => tooltipEl.appendChild(e));

    tooltipEl.style.opacity = '1';
    tooltipEl.style.padding = `${tooltip.options.padding}px ${tooltip.options.padding}px`;
    tooltipEl.style.zIndex = '5';
};
