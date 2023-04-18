/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MasonryLayout } from 'pc-nrfconnect-shared';

import { events } from '../../../features/tracing/tracePacketEvents';
import { convert } from '../../../features/tracingEvents';
import { initialState } from '../../../features/tracingEvents/at';
import {
    getDashboardState,
    getPowerSavingMode,
    setDashboardState,
} from '../../../features/tracingEvents/dashboardSlice';
import { getLive, getSelectedTime } from '../Chart/chartSlice';
import Device from './Device';
import LTENetwork from './LTENetwork';
import PacketDomainNetwork from './PacketDomainNetwork';
import PowerSavingMode from './PowerSavingMode';
import Sim from './Sim';
import ConnectivityStatistics from './Statistics';

const getNewDashboardState = (live: boolean, timestamp: number) => {
    if (live) {
        return events.reduce(
            (current, packet) => ({
                ...current,
                ...convert(packet, current),
            }),
            initialState()
        );
    }

    return events
        .filter(packet => packet.timestamp <= timestamp)
        .reduce(
            (current, packet) => ({
                ...current,
                ...convert(packet, current),
            }),
            initialState()
        );
};

export default () => {
    const dispatch = useDispatch();
    const timestamp = useSelector(getSelectedTime);
    const live = useSelector(getLive);
    const powerSavingMode = useSelector(getPowerSavingMode);
    const { accessPointNames } = useSelector(getDashboardState);
    useEffect(() => {
        const delayedProcess = setTimeout(() => {
            const newState = getNewDashboardState(live, timestamp);
            dispatch(setDashboardState(newState));
        });
        return () => clearTimeout(delayedProcess);
    }, [dispatch, live, timestamp]);

    return (
        <MasonryLayout className="cards-container" minWidth={350}>
            <LTENetwork />
            <Device />
            <Sim />
            {accessPointNames != null
                ? Object.values(accessPointNames).map(apn =>
                      PacketDomainNetwork(apn)
                  )
                : null}
            {powerSavingMode !== undefined ? <PowerSavingMode /> : null}
            <ConnectivityStatistics />
        </MasonryLayout>
    );
};
