/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ChartArea } from 'chart.js';

import { XAxisRange } from './state';

import './timeSpanDeltaLine.scss';

const format = (microseconds: number) => {
    if (Number.isNaN(microseconds)) return null;
    const usec = Math.floor(microseconds);
    const u = `${usec % 1000}`;

    if (usec < 1000) return `${u}\u00B5s`;
    const t = new Date(Math.floor(usec / 1000));
    const z = `${t.getUTCMilliseconds()}`;

    if (usec < 10000) return `${z}.${u.padStart(3, '0')}ms`;
    if (usec < 100000) return `${z}.${u.padStart(3, '0').substring(0, 2)}ms`;
    if (usec < 1000000) return `${z}.${u.padStart(3, '0').substring(0, 1)}ms`;

    const s = `${t.getUTCSeconds()}`;
    if (usec < 10000000) return `${s}.${z.padStart(3, '0')}s`;
    if (usec < 60000000) return `${s}.${z.padStart(3, '0').substring(0, 2)}s`;

    const m = `${t.getUTCMinutes()}`;
    if (usec < 600000000)
        return `${m}:${s.padStart(2, '0')}.${z
            .padStart(3, '0')
            .substring(0, 1)}m`;
    if (usec < 3600000000) return `${m}:${s.padStart(2, '0')}m`;

    const h = `${t.getUTCHours()}`;
    if (usec < 86400000000)
        return `${h}:${m.padStart(2, '0')}:${s.padStart(2, '0')}h`;

    const d = Math.floor(usec / 86400000000);
    return `${d}d ${h}:${m.padStart(2, '0')}h`;
};

interface TimeSpanLineProps {
    range: XAxisRange;
    chartArea: ChartArea | undefined;
}

const TimeSpanDeltaLine = ({ range, chartArea }: TimeSpanLineProps) => {
    const duration = range.max - range.min;

    const label = `\u0394${format(duration * 1000)}`;

    return (
        <div
            className="time-delta-line"
            style={{
                width: `${chartArea?.width ?? 0}px`,
                position: 'relative',
                left: `${chartArea?.left ?? 0}px`,
            }}
        >
            <div className="content">
                <div className="start">
                    {format(Math.round(range.min) * 1000)}
                </div>
                <div className="delta">{label}</div>
                <div className="end">
                    {format(Math.round(range.max) * 1000)}
                </div>
            </div>
        </div>
    );
};

export default TimeSpanDeltaLine;
