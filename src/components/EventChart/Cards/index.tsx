/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { convert, initialState } from '../../../features/at';
import { getAT, setAT } from '../../../features/at/atSlice';
import {
    events,
    tracePacketEvents,
} from '../../../features/tracing/tracePacketEvents';
import { getSelectedTime } from '../Chart/chartSlice';
import Device from './Device';
import LTENetwork from './LTENetwork';
import Modem from './Modem';
import Sim from './Sim';

export default () => {
    const timestamp = useSelector(getSelectedTime);
    const dispatch = useDispatch();
    const atState = useSelector(getAT);

    useEffect(() => {
        const handler = () => {
            // TODO: Create new state based on atState
            // TODO: Filter out events later than selected time
            const newState = events
                .filter(packet => packet.timestamp < timestamp * 1000)
                .reduce(
                    (current, packet) => ({
                        ...current,
                        ...convert(packet, current),
                    }),
                    initialState()
                );
            console.log(newState);
            dispatch(setAT(newState));
        };

        tracePacketEvents.on('new-packets', handler);
        return () => {
            tracePacketEvents.removeListener('new-packets', handler);
        };
    }, [dispatch, atState, timestamp]);

    return (
        <div className="cards-container">
            <Device />
            <Sim />
            <LTENetwork />
            <Modem />
        </div>
    );
};
