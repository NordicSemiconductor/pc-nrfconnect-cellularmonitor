import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { rawTraceData } from '../../../data/trace';
import { convert, initialState, Packet } from '../../at';
import { getSelectedTime } from './chart.slice';
import { Events } from './Events';
import SimCard from './SimCard';

import './Events.scss';

const traceData = rawTraceData.map<Packet>(jsonPacket => ({
    format: jsonPacket.format,
    packet_data: new Uint8Array(jsonPacket.packet_data.data),
    timestamp: jsonPacket.timestamp,
}));

const TemporaryTab = () => {
    const timestamp = useSelector(getSelectedTime); // Last item of the included trace file
    const state = useMemo(
        () =>
            traceData
                .filter(
                    packet => (packet.timestamp?.value ?? 0) < timestamp * 1000
                )
                .reduce(
                    (current, packet) => ({
                        ...current,
                        ...convert(packet, current),
                    }),
                    initialState()
                ),
        [timestamp]
    );

    return (
        <div className="events-container">
            <div className="cards-container">
                <SimCard />
                <SimCard />
                <SimCard />
                <SimCard />
                <SimCard />
                <SimCard />
                <SimCard />
                <SimCard />
                <SimCard />
            </div>

            <div className="events">
                <div className="code">
                    {JSON.stringify(state, undefined, 4)}
                </div>
                <Events />
            </div>
        </div>
    );
};

export default TemporaryTab;
