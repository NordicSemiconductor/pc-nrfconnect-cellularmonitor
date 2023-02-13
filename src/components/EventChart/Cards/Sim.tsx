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
        xmonitor,
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
        IMSI: { value: imsi ?? 'Unknown', commands: ['AT+CIMI'] },
        OPERATOR: { value: xmonitor?.operatorFullName ?? 'Unknown', commands: ['AT%XMONITOR'] },
        MANUFACTURER: { value: manufacturer ?? 'Unknown', commands: [] },
        ICCID: { value: iccid ?? 'Unknown', commands: [] },
        PIN: { value: pin, commands: [] },
        'PIN RETRIED': { value: remainingPIN ?? 'Unknown', commands: [] },
        'PUK RETRIED': { value: remainingPUK ?? 'Unknown', commands: [] },
        'PIN2 RETRIED': { value: remainingPIN2 ?? 'Unknown', commands: [] },
        'PUK2 RETRIED': { value: remainingPUK2 ?? 'Unknown', commands: [] },
        'LTE-M': { value: 'Not Implemented', commands: [] },
        'NB-IoT': { value: 'Not Implemented', commands: [] },
        IPV4: { value: 'Not Implemented', commands: [] },
        IPV6: { value: 'Not Implemented', commands: [] },
        'NON-IP': { value: 'Not Implemented', commands: [] },
        PSM: { value: 'Not Implemented', commands: [] },
        CDRX: { value: 'Not Implemented', commands: [] },
        EDRX: { value: 'Not Implemented', commands: [] },
        RAI: { value: 'Not Implemented', commands: [] },
        'AS-RAI': { value: 'Not Implemented', commands: [] },
        'CP-RAI': { value: 'Not Implemented', commands: [] },
        NETWORK: { value: 'Not Implemented', commands: [] },
        ISSUER: { value: 'Not Implemented', commands: [] },
    };

    return <DashboardCard title="Sim" iconName="mdi-sim" fields={fields} />;
};
