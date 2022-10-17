import React, { useEffect, useState } from 'react';
import DashboardCard from '../Dashboard/DashboardCard';
import { rawTraceData } from '../../../data/trace';
import { convert, initialState, Packet } from '../../at';
import { Events } from './Events';

import './Events.scss';
import SimCard from './SimCard';

const traceData = rawTraceData.map<Packet>(jsonPacket => ({
    format: jsonPacket.format,
    packet_data: new Uint8Array(jsonPacket.packet_data.data),
    timestamp: jsonPacket.timestamp,
}));

const TemporaryTab = () => {
    const timestamp = 1665058976038000; // Last item of the included trace file
    const [state, setState] = useState(initialState());

    useEffect(() => {
        setState(
            traceData
                .filter(packet => packet.timestamp!.value < timestamp)
                .reduce(
                    (current, packet) => ({
                        ...current,
                        ...convert(packet, current),
                    }),
                    state
                )
        );
    }, [timestamp]);

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
                {/* <div className="code">
                    {JSON.stringify(state, undefined, 4)}
                </div> */}
                <Events />
            </div>
        </div>
    );
};

export default TemporaryTab;
