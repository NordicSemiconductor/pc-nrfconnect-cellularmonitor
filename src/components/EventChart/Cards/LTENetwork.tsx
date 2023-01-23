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
        signalQuality: { rsrp_decibel: RSRP, rsrq_decibel: RSRQ },
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
            'RRC STATE': getRRCStateColor(rrcState),
            MNC: mnc ?? 'Unknown',
            'MNC Code': mncCode ?? 'Unknown',
            MCC: mcc ?? 'Unknown',
            'MCC Code': mccCode ?? 'Unknown',
            'CELL ID': 'Not Implemented',
            PCI: 'Not Implemented',
            SNR: 'Not Implemented',
            'RRC STATE CHANGE CAUSE': 'Not Implemented',
            EARFCN: 'Not Implemented',
            'PUCCH TX POWER': 'Not Implemented',
            'NEIGHBOR CELLS': 'Not Implemented',
            'EMM STATE': 'Not Implemented',
            RSRP: RSRP ?? 'Unknown',
            'CE MODE': 'Not Implemented',
            'BAND INDICATOR': 'Not Implemented',
            'EMM SUBSTATE': 'Not Implemented',
            RSRQ: RSRQ ?? 'Unknown',
            'CE LEVEL': 'Not Implemented',
            'TRACKING AREA': 'Not Implemented',
            'ACTIVITY STATUS': activityStatus ?? 'Unknown',
            STATUS: status,
        };
    }, [
        networkRegistrationStatus,
        RSRP,
        RSRQ,
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
