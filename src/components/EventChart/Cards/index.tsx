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
import { getSelectedTime } from '../Chart/chartSlice';
import Device from './Device';
import LTENetwork from './LTENetwork';
import PacketDomainNetwork from './PacketDomainNetwork';
import PowerSavingMode from './PowerSavingMode';
import Sim from './Sim';
import ConnectivityStatistics from './Statistics';

export default () => {
    const timestamp = useSelector(getSelectedTime);
    const dispatch = useDispatch();
    const powerSavingMode = useSelector(getPowerSavingMode);
    const { accessPointNames } = useSelector(getDashboardState);
    useEffect(() => {
        // TODO: Create new state based on atState
        // TODO: Filter out events later than selected time
        const newState = events
            .filter(packet => packet.timestamp < timestamp)
            .reduce(
                (current, packet) => ({
                    ...current,
                    ...convert(packet, current),
                }),
                initialState()
            );
        dispatch(setDashboardState(newState));
    }, [dispatch, timestamp]);

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
