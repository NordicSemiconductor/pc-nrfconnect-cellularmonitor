/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getLTE } from '../../../features/at/atSlice';
import DashboardCard from './DashboardCard';

export default () => {
    const LTEView = useSelector(getLTE);

    const signalQuality =
        LTEView.signalQuality === 255
            ? 'Unknown'
            : `${LTEView.signalQuality}dB`;

    const fields = {
        'Signal Quality': signalQuality,
        'Activity Status': LTEView.activityStatus ?? 'Unknown',
    };

    return (
        <DashboardCard
            title="LTE Network"
            iconName="mdi-access-point-network"
            onclick={null}
            fields={fields}
        >
            {/* <ul>
                {Object.entries(fields).map(([key, value]) => (
                    <li key={key}>
                        <p className="card-key">{key}</p>
                        <p className="card-value">{value}</p>
                    </li>
                ))}
            </ul> */}
        </DashboardCard>
    );
};
