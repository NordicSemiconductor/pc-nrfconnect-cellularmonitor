/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { networkStatus } from '../../../features/tracingEvents/at/commandProcessors/networkRegistrationStatusNotification';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import type { RRCState } from '../../../features/tracingEvents/types';
import DashboardCard from './DashboardCard';

type RRCStateFlag = '🟡' | '🟢' | '🔴';

const getRRCStateColor = (
    state: RRCState | undefined
): `${RRCStateFlag}${string}` => {
    switch (state) {
        case 0:
            return '🟡 Idle';
        case 1:
            return '🟢 Connected';
        default:
            return '🔴 Unknown';
    }
};

export default () => {
    const {
        signalQuality,
        networkRegistrationStatus,
        activityStatus,
        rrcState,
        mcc,
        mccCode,
        mnc,
        mncCode,
        networkType,
    } = useSelector(getDashboardState);

    const fields = useMemo(() => {
        let status = 'Unknown';
        const statusCode = networkRegistrationStatus?.status;
        if (statusCode !== undefined) {
            const [label, value] = Object.entries(networkStatus).filter(
                ([statusKey]) => statusKey === `${statusCode}`
            )[0];
            if (label) {
                status = `${label}: ${value.short}`;
            }
        }

        return {
            'RRC STATE': { value: getRRCStateColor(rrcState), commands: [] },
            MNC: { value: mnc ?? 'Unknown', commands: [] },
            'MNC Code': { value: mncCode ?? 'Unknown', commands: [] },
            MCC: { value: mcc ?? 'Unknown', commands: [] },
            'MCC Code': { value: mccCode ?? 'Unknown', commands: [] },
            'CELL ID': { value: 'Not Implemented', commands: [] },
            PCI: { value: 'Not Implemented', commands: [] },
            SNR: { value: 'Not Implemented', commands: [] },
            'RRC STATE CHANGE CAUSE': { value: 'Not Implemented', commands: [] },
            EARFCN: { value: 'Not Implemented', commands: [] },
            'PUCCH TX POWER': { value: 'Not Implemented', commands: [] },
            'NEIGHBOR CELLS': { value: 'Not Implemented', commands: [] },
            'EMM STATE': { value: 'Not Implemented', commands: [] },
            RSRP: { value: signalQuality?.rsrp_decibel ?? 'Unknown', commands: [] },
            'CE MODE': { value: 'Not Implemented', commands: [] },
            'BAND INDICATOR': { value: 'Not Implemented', commands: [] },
            'EMM SUBSTATE': { value: 'Not Implemented', commands: [] },
            RSRQ: { value: signalQuality?.rsrq_decibel ?? 'Unknown', commands: [] },
            'CE LEVEL': { value: 'Not Implemented', commands: [] },
            'TRACKING AREA': { value: 'Not Implemented', commands: [] },
            'ACTIVITY STATUS': { value: activityStatus ?? 'Unknown', commands: [] },
            STATUS: { value: status, commands: [] },
        };
    }, [
        networkRegistrationStatus,
        signalQuality,
        activityStatus,
        rrcState,
        mnc,
        mncCode,
        mcc,
        mccCode,
    ]);

    return (
        <DashboardCard
            title={`${networkType} Network`.trim()}
            iconName="mdi-access-point-network"
            fields={fields}
        />
    );
};
