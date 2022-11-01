/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { convert, initialState } from '../../features/at';
import { setAT } from '../../features/at/atSlice';
import { getTracePackets } from '../../features/tracing/traceSlice';
import Device from './Cards/Device';
import LTECard from './Cards/LTENetwork';
import ModemCard from './Cards/Modem';
import SimCard from './Cards/Sim';
import { Chart } from './Chart/Chart';
import { getSelectedTime } from './Chart/chartSlice';

import './Dashboard.scss';

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
    }, [dispatch, packets, timestamp]);

    return (
        <div className="events-container">
            <div className="cards-container">
                <Device />
                <SimCard />
                <LTECard />
                <ModemCard />
            </div>

            <div>
                <div id="tooltip" />
                <Chart packets={packets} />
            </div>
        </div>
    );
};

export default Dashboard;
