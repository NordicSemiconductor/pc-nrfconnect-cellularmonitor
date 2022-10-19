/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { rawTraceData } from '../../../data/trace';
import { convert, initialState, Packet } from '../../at';
import { setAT } from '../../at/atSlice';
import { getSelectedTime } from './chart.slice';
import { Events } from './Events';
import SimCard from './SimCard';

import './Events.scss';
import ModemCard from './ModemCard';

const traceData = rawTraceData.map<Packet>(jsonPacket => ({
    format: jsonPacket.format,
    packet_data: new Uint8Array(jsonPacket.packet_data.data),
    timestamp: jsonPacket.timestamp,
}));

const TemporaryTab = () => {
    const timestamp = useSelector(getSelectedTime);
    const dispatch = useDispatch();

    useEffect(() => {
        const newState = traceData
            .filter(packet => (packet.timestamp?.value ?? 0) < timestamp * 1000)
            .reduce(
                (current, packet) => ({
                    ...current,
                    ...convert(packet, current),
                }),
                initialState()
            );
        dispatch(setAT(newState));
    }, [timestamp, dispatch]);

    return (
        <div className="events-container">
            <div className="cards-container">
                <ModemCard />
                <SimCard />
            </div>

            <div className="events">
                <Events />
            </div>
        </div>
    );
};

export default TemporaryTab;
