/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getAT } from '../../../features/at/atSlice';
import { networkStatus } from '../../../features/at/commandProcessors/networkRegistrationStatusNotification';
import DashboardCard from './DashboardCard';

export default () => {
    const {
        signalQuality: { rsrp_decibel: RSRP, rsrq_decibel: RSRQ },
        networkRegistrationStatus,
        activityStatus,
        
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
            'RRC STAT': 'Not Implemented',
            PCI: 'Not Implemented',
            SNR: 'Not Implemented',
            MCC: 'Not Implemented',
            'CELL ID': 'Not Implemented',
            'RRC STATE CHANGE CAUSE': 'Not Implemented',
            EARFCN: 'Not Implemented',
            'PUCCH TX POWER': 'Not Implemented',
            MNC: 'Not Implemented',
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
    }, [networkRegistrationStatus]);

    return (
        <DashboardCard
            title="LTE Network"
            iconName="mdi-access-point-network"
            fields={fields}
        />
    );
};
