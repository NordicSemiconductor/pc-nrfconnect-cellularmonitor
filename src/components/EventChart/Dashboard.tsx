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
import { Chart } from './Chart/Chart';
import SimCard from './Cards/SimCard';

import './Dashboard.scss';
import ModemCard from './Cards/ModemCard';
import LTECard from './Cards/LTECard';
import { getTracePackets } from '../../features/tracing/traceSlice';

const Dashboard = () => {
    const timestamp = useSelector(getSelectedTime);
    const packets = useSelector(getTracePackets);
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

            <div>
                <div id="tooltip"></div>
                <Chart packets={packets} />
            </div>
        </div>
    );
};

export default Dashboard;
