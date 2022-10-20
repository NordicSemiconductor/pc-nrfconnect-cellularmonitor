/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { convert, initialState, Packet } from '../../at';
import { setAT } from '../../at/atSlice';
import { getSelectedTime } from './chart.slice';
import { Events } from './Events';
import SimCard from './SimCard';

import './Events.scss';
import ModemCard from './ModemCard';
import { DataPacket } from '@nordicsemiconductor/nrf-monitor-lib-js';

// const traceData = rawTraceData.map<Packet>(jsonPacket => ({
//     format: jsonPacket.format,
//     packet_data: new Uint8Array(jsonPacket.packet_data.data),
//     timestamp: jsonPacket.timestamp,
// }));

// export const traceData: Packet[] = [];

export const traceEvents = new EventTarget();

export const notifyDashboard = (packet: DataPacket) =>
    traceEvents.dispatchEvent(
        new CustomEvent('new-packet', { detail: packet })
    );

const TemporaryTab = () => {
    const timestamp = useSelector(getSelectedTime);
    const dispatch = useDispatch();

    const [packets, setPackets] = useState<Packet[]>([]);

    const newPacketListener = useCallback(event => {
        setPackets(previous => [...previous, event.detail]);
    }, []);

    useEffect(() => {
        traceEvents.addEventListener('new-packet', newPacketListener);
    }, []);

    useEffect(() => {
        const newState = packets
            .filter(packet => (packet.timestamp?.value ?? 0) < timestamp * 1000)
            .reduce(
                (current, packet) => ({
                    ...current,
                    ...convert(packet, current),
                }),
                initialState()
            );
        dispatch(setAT(newState));
    }, [packets, timestamp]);



    return (
        <div className="events-container">
            <div className="cards-container">
                <ModemCard />
                <SimCard />
            </div>

            <div className="events">
                <div id="tooltip" style={{ position: 'relative' }}></div>
                <Events />
            </div>
        </div>
    );
};

export default TemporaryTab;
