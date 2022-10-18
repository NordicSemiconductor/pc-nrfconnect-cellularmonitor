/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getSIM } from '../../at/atSlice';
import DashboardCard from '../Dashboard/DashboardCard';

export default () => {
    const SIMView = useSelector(getSIM);

    const something = {
        IMSI: SIMView.iccid ?? 'Unknown',
        Operator: SIMView.operator ?? 'Unknown',
        manufacturer: SIMView.manufacturer ?? 'Unknown',
        ICCID: SIMView.iccid ?? 'Unknown',
        // ODIS: false,
        PIN: SIMView.pin,
        // PUK: false,
        'Remaining PIN retries': SIMView.remainingPIN ?? 'unknown',
        'Remaining PUK retries': SIMView.remainingPUK ?? 'unknown',
        // 'Restricted SIM Access?': false,
        // 'Generic SIM Access?': false,
    };

    return (
        <DashboardCard title="Sim Card" iconName="mdi-sim" onclick={() => {}}>
            <ul>
                {Object.entries(something).map(([key, value]) => (
                    <li key={key}>
                        {key}: {value}
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
};
