/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { TooltipModel } from 'chart.js';

import { Packet } from '../../at';
import './Tooltip.css';

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

export const PacketTooltip = (tooltip: TooltipModel<'scatter'>) => {
    const { caretX, dataPoints } = tooltip;

    const point = dataPoints[0];
    if (!point) return;

    const packet = (point.raw as { event: Packet }).event;

    const timestamp = new Date(packet.timestamp?.value ?? 0);
    const timestampLabel = dateFormatter.format(timestamp);

    const others =
        dataPoints.length === 1
            ? ''
            : '+' + (dataPoints.length - 1) + ' others';

    // Make sure tooltips dont start rendering too far to the sides
    const x =  Math.max(Math.min(tooltip.chart.width - 150, caretX), 150);

    return (
        <div className="point-tooltip" style={{ left: x + 'px' }}>
            <div className="d-flex justify-content-end">
                <span className="text-muted">{others}</span>
            </div>

            <p>{JSON.parse(packet.packet_data.toString())}</p>
            <span className="text-muted">{timestampLabel}</span>
        </div>
    );
};
