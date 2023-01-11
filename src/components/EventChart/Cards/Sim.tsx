/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard from './DashboardCard';

export default () => {
    const {
        iccid,
        imsi,
        xmonitor: { operatorFullName: operator },
        manufacturer,
        pinCodeStatus: pin,
        pinRetries: {
            SIM_PIN: remainingPIN,
            SIM_PUK: remainingPUK,
            SIM_PIN2: remainingPIN2,
            SIM_PUK2: remainingPUK2,
        },
    } = useSelector(getDashboardState);

    const fields = {
        IMSI: imsi ?? 'Unknown',
        ISSUER: 'Not Implemented',
        NETWORK: 'Not Implemented',
        OPERATOR: operator ?? 'Unknown',
        MANUFACTURER: manufacturer ?? 'Unknown',
        ICCID: iccid ?? 'Unknown',
        PIN: pin,
        'PIN RETRIED': remainingPIN ?? 'Unknown',
        'PUK RETRIED': remainingPUK ?? 'Unknown',
        'PIN2 RETRIED': remainingPIN2 ?? 'Unknown',
        'PUK2 RETRIED': remainingPUK2 ?? 'Unknown',
        'LTE-M': 'Not Implemented',
        'NB-IoT': 'Not Implemented',
        IPV4: 'Not Implemented',
        IPV6: 'Not Implemented',
        'NON-IP': 'Not Implemented',
        PSM: 'Not Implemented',
        CDRX: 'Not Implemented',
        EDRX: 'Not Implemented',
        RAI: 'Not Implemented',
        'AS-RAI': 'Not Implemented',
        'CP-RAI': 'Not Implemented',
    };

    return <DashboardCard title="Sim" iconName="mdi-sim" fields={fields} />;
};
