/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getLTE } from '../../../features/at/atSlice';
import { networkStatus } from '../../../features/at/commandProcessors/networkRegistrationStatusNotification';
import DashboardCard from './DashboardCard';

export default () => {
    const LTEView = useSelector(getLTE);

    const fields = useMemo(() => {
        let status = 'Unknown';
        const statusCode = LTEView.networkRegistrationStatus?.status;
        if (statusCode !== undefined) {
            const [label, value] = Object.entries(networkStatus).filter(
                ([statusKey]) => statusKey === `${statusCode}`
            )[0];
            if (label) {
                status = `${label}: ${value.short}`;
            }
        }

        return {
            'Signal Quality': 'Unknown',
            'Activity Status': 'Unknown',
            Status: status,
        };
    }, [LTEView.networkRegistrationStatus]);

    return (
        <DashboardCard
            title="LTE Network"
            iconName="mdi-access-point-network"
            fields={fields}
        />
    );
};
