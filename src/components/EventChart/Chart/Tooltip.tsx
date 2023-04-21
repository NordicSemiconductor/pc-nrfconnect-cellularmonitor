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

import { EventColours } from '../../../features/tracing/formats';
import { TraceEvent } from '../../../features/tracing/tracePacketEvents';

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
});

const tooltipArrowInnerSide = 12;
const tooltipArrowBorder = 1;
const tooltipArrowDiagonal =
    Math.round(Math.hypot(tooltipArrowInnerSide, tooltipArrowInnerSide) / 2) +
    tooltipArrowBorder; // half the hypotenuse floored + border

let tooltipIsBeingHovered = false;

const getTooltipLeft = (
    chart: Chart<
        keyof ChartTypeRegistry,
        (number | Point | [number, number] | BubbleDataPoint | null)[],
        unknown
    >,
    tooltip: TooltipModel<'scatter'>,
    tooltipEl: HTMLDivElement
) => {
    // Restrict by the chart border of the chart or the outermost part of the tooltip arrow
    const min = Math.min(
        chart.chartArea.left,
        tooltip.caretX - tooltipArrowDiagonal
    );
    const max =
        Math.max(chart.chartArea.right, tooltip.caretX + tooltipArrowDiagonal) -
        tooltipEl.offsetWidth;

    return (
        Math.min(
            Math.max(tooltip.caretX - tooltipEl.offsetWidth / 2, min),
            max
        ) + chart.canvas.offsetLeft
    );
};
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
        tooltipEl.className = 'packet-tooltip';
        tooltipEl.style.borderWidth = '1px';
        tooltipEl.style.borderStyle = 'solid';
        tooltipEl.style.userSelect = 'text';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.transition = 'all .1s ease';
        tooltipEl.style.padding = '16px';
        tooltipEl.style.zIndex = '5';
        tooltipEl.style.boxShadow = '2px 3px 3px #00000082';
        tooltipEl.style.maxWidth = '400px';

        chart.canvas.parentNode.appendChild(tooltipEl);

        const observer = new MutationObserver(() => {
            if (!tooltipEl || tooltipEl.style.opacity !== '1') return;

            tooltipEl.style.left = `${getTooltipLeft(
                chart,
                tooltip,
                tooltipEl
            )}px`;

            const pointRadius = (
                chart.data.datasets[0] as ChartDataset<'scatter'>
            ).pointRadius as number;

            tooltipEl.style.top = `${
                tooltip.caretY +
                chart.canvas.offsetTop -
                tooltipEl.clientHeight -
                pointRadius -
                7 // give space for arrow underneath the tooltip
            }px`;
        });
        observer.observe(tooltipEl, {
            childList: true,
            attributes: true,
        });

        tooltipEl.classList.add('hoverable');
        tooltipEl.addEventListener('mouseenter', () => {
            tooltipIsBeingHovered = true;
        });
        tooltipEl.addEventListener('mouseleave', () => {
            tooltipIsBeingHovered = false;
            if (tooltip.opacity === 0 && tooltipEl) {
                tooltipEl.style.opacity = '0';
                tooltipEl.style.pointerEvents = 'none';
            }
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

    if ((tooltip.opacity === 0 || !dataPoints[0]) && !tooltipIsBeingHovered) {
        tooltipEl.style.opacity = '0';
        tooltipEl.style.pointerEvents = 'none';
        return;
    }

    const packet = (dataPoints[0].raw as { event: TraceEvent }).event;

    const children = [];
    if (tooltip.body) {
        tooltipEl.style.background = EventColours[packet.format].light;
        tooltipEl.style.borderColor = EventColours[packet.format].dark;
        tooltipEl.style.color = EventColours[packet.format].dark;

        const hoveringMultiple = dataPoints.length > 1;
        if (hoveringMultiple) {
            const multipleP = document.createElement('p');
            const multipleText = document.createTextNode('MULTIPLE EVENTS');
            multipleP.appendChild(multipleText);
            multipleP.style.fontSize = '12px';
            children.push(multipleP);
        } else {
            // Data/Event Type
            const dataP = document.createElement('p');
            const data =
                packet.format === 'AT' ? packet.data.toString() : packet.format;
            const textP = document.createTextNode(data as string);
            dataP.appendChild(textP);
            children.push(dataP);
            dataP.style.fontSize = '12px';
            dataP.style.marginBottom = '16px';
            dataP.style.whiteSpace = 'normal';
            dataP.style.overflowWrap = 'break-word';

            // Timestamp
            const timestampDiv = document.createElement('div');
            timestampDiv.style.display = 'flex';
            timestampDiv.style.flexDirection = 'row';
            timestampDiv.style.justifyContent = 'space-between';
            timestampDiv.style.fontSize = '10px';

            const dateDiv = document.createElement('div');
            const date = dateFormatter.format(new Date(packet.timestamp));
            const dateText = document.createTextNode(date);
            dateDiv.appendChild(dateText);
            dateDiv.style.marginRight = '16px';
            timestampDiv.appendChild(dateDiv);

            const timeDiv = document.createElement('div');
            const time = timeFormatter.format(new Date(packet.timestamp));
            const timeText = document.createTextNode(time);
            timeDiv.appendChild(timeText);
            timestampDiv.appendChild(timeDiv);

            children.push(timestampDiv);
        }
    }

    // Arrow
    const arrowDiv = document.createElement('div');
    arrowDiv.style.position = 'absolute';
    arrowDiv.style.transform = 'rotate(45deg)';
    arrowDiv.style.background = `linear-gradient(to bottom right, transparent 50%, ${
        EventColours[packet.format].light
    } 50%`;
    arrowDiv.style.boxShadow = '2px 3px 3px #00000080';
    arrowDiv.style.borderWidth = '0 1px 1px 0';
    arrowDiv.style.borderStyle = 'solid';
    arrowDiv.style.borderColor = `${EventColours[packet.format].dark}`;
    arrowDiv.style.width = `${tooltipArrowInnerSide}px`;
    arrowDiv.style.height = `${tooltipArrowInnerSide}px`;
    const observer = new MutationObserver(() => {
        arrowDiv.style.left = `${
            tooltip.caretX -
            Number(
                tooltipEl.style.left.substring(
                    0,
                    tooltipEl.style.left.length - 2
                )
            ) +
            tooltipArrowDiagonal
        }px`;
    });
    observer.observe(tooltipEl, {
        childList: true,
        attributes: true,
    });
    arrowDiv.style.bottom = `-${
        tooltipArrowInnerSide / 2 + tooltipArrowBorder
    }px`;

    children.push(arrowDiv);

    while (tooltipEl.firstChild) {
        tooltipEl.firstChild.remove();
    }

    children.forEach(e => tooltipEl.appendChild(e));

    tooltipEl.style.opacity = '1';
    tooltipEl.style.pointerEvents = 'auto';
};
