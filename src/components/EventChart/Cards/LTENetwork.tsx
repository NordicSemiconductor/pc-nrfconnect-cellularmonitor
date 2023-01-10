/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RRCState } from '../../../features/tracingEvents';
import { networkStatus } from '../../../features/tracingEvents/at/commandProcessors/networkRegistrationStatusNotification';
import { getAT } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard from './DashboardCard';

type RRCStateFlag = '🟡' | '🔴' | '🔵' | '🟢';

const getRRCStateColor = (state: RRCState | undefined): RRCStateFlag => {
    if (state === 'rrcConnectionSetup') {
        return '🟡';
    }

    if (state === 'rrcConnectionSetupRequest') {
        return '🔵';
    }

    if (state === 'rrcConnectionRelease') {
        return '🟡';
    }

    if (state === 'rrcConnectionSetupComplete') {
        return '🟢';
    }

    // return '🔴';
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
    } = useSelector(getAT);

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
            title="LTE Network"
            iconName="mdi-access-point-network"
            fields={fields}
        />
    );
};
