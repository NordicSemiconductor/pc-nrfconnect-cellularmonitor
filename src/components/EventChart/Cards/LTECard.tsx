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
    const signalQuality =
        LTEView.signalQuality === 255
            ? 'Unknown'
            : `${LTEView.signalQuality}dB`;

    useEffect(() => {
        const statusCode = `${LTEView.networkRegistrationStatus?.status}`;
        if (statusCode) {
            const result = Object.entries(networkStatus).filter(
                ([statusKey, status]) => statusKey === statusCode
            )[0];
            if (result) {
                setFields({
                    ...fields,
                    Status: `${result[0]}: ${result[1].short}` ?? 'Unknown',
                });
            }
        }
    }, [LTEView.networkRegistrationStatus]);

    return (
        <DashboardCard
            title="LTE Network"
            iconName="mdi-access-point-network"
            onclick={null}
            fields={fields}
        />
    );
};
