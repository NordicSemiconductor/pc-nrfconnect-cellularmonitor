/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { convert, initialState, Packet } from '../../at';
import { setAT } from '../../at/atSlice';
import { getSelectedTime } from './Chart/chartSlice';
import { Events } from './Chart/Chart';
import SimCard from './Cards/SimCard';

import './Dashboard.scss';
import ModemCard from './Cards/ModemCard';
import { DataPacket } from '@nordicsemiconductor/nrf-monitor-lib-js';

export const traceEvents = new EventTarget();

const packets: Packet[] = [];

export const notifyDashboard = (packet: DataPacket) => {
    packets.push(packet as Packet);
    traceEvents.dispatchEvent(
        new CustomEvent('new-packet', { detail: packets })
    );
};

const EventsTab = () => {
    const timestamp = useSelector(getSelectedTime);
    const dispatch = useDispatch();

    const [packetList, setPacketList] = useState({ packets });

    useEffect(() => {
        traceEvents.addEventListener('new-packet', () =>
            setPacketList({ packets })
        );
    }, []);

    useEffect(() => {
        const newState = packetList.packets
            .filter(packet => (packet.timestamp?.value ?? 0) < timestamp * 1000)
            .reduce(
                (current, packet) => ({
                    ...current,
                    ...convert(packet, current),
                }),
                initialState()
            );
        dispatch(setAT(newState));
    }, [packetList, timestamp]);

    return (
        <div className="events-container">
            <div className="cards-container">
                <ModemCard />
                <SimCard />
            </div>

            <div className="events">
                <div id="tooltip" style={{ position: 'relative' }}></div>
                <Events packets={packetList.packets} />
            </div>
        </div>
    );
};

export default EventsTab;
