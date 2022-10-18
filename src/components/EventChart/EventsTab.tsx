/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { rawTraceData } from '../../../data/trace';
import { convert, initialState, Packet } from '../../at';
import { setAT } from '../../at/atSlice';
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
    const dispatch = useDispatch();
    const state = useMemo(() => {
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
        return newState;
    }, [timestamp, dispatch]);

    return (
        <div className="events-container">
            <div className="cards-container">
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
