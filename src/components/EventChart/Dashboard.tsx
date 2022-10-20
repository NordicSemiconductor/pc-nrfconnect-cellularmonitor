/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { convert, initialState, Packet } from '../../features/at';
import { setAT } from '../../features/at/atSlice';
import { getSelectedTime } from './Chart/chartSlice';
import { Events } from './Chart/Chart';
import SimCard from './Cards/SimCard';

import './Dashboard.scss';
import ModemCard from './Cards/ModemCard';
import { DataPacket } from '@nordicsemiconductor/nrf-monitor-lib-js';
import LTECard from './Cards/LTECard';
import { getEventPackets } from './eventsSlice';

const Dashboard = () => {
    const timestamp = useSelector(getSelectedTime);
    const packets = useSelector(getEventPackets);
    const dispatch = useDispatch();

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
                <LTECard />
            </div>

            <div className="events">
                <div id="tooltip"></div>
                <Events packets={packets} />
            </div>
        </div>
    );
};

export default Dashboard;
