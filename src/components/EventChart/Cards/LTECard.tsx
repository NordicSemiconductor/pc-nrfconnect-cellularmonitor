/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { getLTE } from '../../../features/at/atSlice';
import { networkStatus } from '../../../features/at/commandProcessors/networkRegistrationStatusNotification';
import DashboardCard from './DashboardCard';

export default () => {
    const [fields, setFields] = useState({
        Status: 'Unknown',
        'Signal Quality': 'Unknown',
        'Activity Status': 'Unknown',
    });

    const LTEView = useSelector(getLTE);

    useEffect(() => {
        const statusCode = `${LTEView.networkRegistrationStatus?.status}`;
        if (statusCode) {
            const [label, value] = Object.entries(networkStatus).filter(
                ([statusKey]) => statusKey === statusCode
            )[0];
            if (label) {
                setFields({
                    ...fields,
                    Status: `${label}: ${value.short}` ?? 'Unknown',
                });
            }
        }
    }, [LTEView.networkRegistrationStatus, fields]);

    return (
        <DashboardCard
            title="LTE Network"
            iconName="mdi-access-point-network"
            onclick={null}
            fields={fields}
        />
    );
};
