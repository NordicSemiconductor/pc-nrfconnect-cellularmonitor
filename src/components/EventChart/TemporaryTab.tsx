import React, { useEffect, useState } from 'react';
import { Card } from 'pc-nrfconnect-shared';

import { rawTraceData } from '../../../data/trace';
import { convert, initialState, Packet } from '../../at';
import { Events } from './Events';

import './Event.css';

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
        <div className="dashboard-container events-dashboard">
            <div className="dashboard">
                <Card title="Sim Card">
                    <ul>
                        <li>IMSI</li>
                        <li>Operator</li>
                        <li>ICCID</li>
                        <li>ODIS?</li>
                        <li>Post device manufacturerer?</li>
                        <li>PIN</li>
                        <li>PUK</li>
                        <li>Remaiing PIN retries</li>
                        <li>Restricted SIM Access?</li>
                        <li>Generic SIM Access?</li>
                    </ul>
                </Card>
                <Card title="Sim Card">
                    <ul>
                        <li>IMSI</li>
                        <li>Operator</li>
                        <li>ICCID</li>
                        <li>ODIS?</li>
                        <li>Post device manufacturerer?</li>
                        <li>PIN</li>
                        <li>PUK</li>
                        <li>Remaiing PIN retries</li>
                        <li>Restricted SIM Access?</li>
                        <li>Generic SIM Access?</li>
                    </ul>
                </Card>
                <Card title="Sim Card">
                    <ul>
                        <li>IMSI</li>
                        <li>Operator</li>
                        <li>ICCID</li>
                        <li>ODIS?</li>
                        <li>Post device manufacturerer?</li>
                        <li>PIN</li>
                        <li>PUK</li>
                        <li>Remaiing PIN retries</li>
                        <li>Restricted SIM Access?</li>
                        <li>Generic SIM Access?</li>
                    </ul>
                </Card>
                <Card title="Sim Card">
                    <ul>
                        <li>IMSI</li>
                        <li>Operator</li>
                        <li>ICCID</li>
                        <li>ODIS?</li>
                        <li>Post device manufacturerer?</li>
                        <li>PIN</li>
                        <li>PUK</li>
                        <li>Remaiing PIN retries</li>
                        <li>Restricted SIM Access?</li>
                        <li>Generic SIM Access?</li>
                    </ul>
                </Card>
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
