import React from 'react';
import { TooltipModel } from 'chart.js';

import { Packet } from '../../at';

export const PacketTooltip = (tooltip: TooltipModel<'scatter'>) => {
    const { caretX, caretY, dataPoints } = tooltip;

    const point = dataPoints[0];
    if (!point) return;

    const { format } = (point.raw as { event: Packet }).event;

    return (
        <div
            style={{
                position: 'absolute',
                left: caretX,
                top: caretY,
                background: 'white',
                border: '1px solid #ccc',
                padding: '4px',
            }}
        >
            <strong>{format}</strong>
            {JSON.stringify(point.raw)}
        </div>
    );
};
