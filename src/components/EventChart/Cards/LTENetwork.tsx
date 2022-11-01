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
        signalQuality: { rsrp_decibel: signalQuality },
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
            'Signal Quality': signalQuality ?? 'Unknown',
            'Activity Status': activityStatus ?? 'Unknown',
            Status: status,
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
