/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { documentation } from '../../../../resources/docs/dashboard_fields';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

const { Sim: docs } = documentation;

export default () => {
    const {
        iccid,
        imsi,
        manufacturer,
        operatorFullName,
        pinCodeStatus: pin,
        pinRetries: {
            SIM_PIN: remainingPIN,
            SIM_PUK: remainingPUK,
            SIM_PIN2: remainingPIN2,
            SIM_PUK2: remainingPUK2,
        },
    } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        IMSI: {
            value: imsi ?? 'Unknown',
            ...docs.IMSI,
        },
        OPERATOR: {
            value: operatorFullName ?? 'Unknown',
            ...docs.OPERATOR,
        },
        MANUFACTURER: {
            value: manufacturer ?? 'Unknown',
            ...docs.MANUFACTURER,
        },
        ICCID: {
            value: iccid ?? 'Unknown',
            ...docs.ICCID,
        },
        PIN: { value: pin, ...docs.PIN },
        'PIN RETRIED': {
            value: remainingPIN ?? 'Unknown',
            ...docs['PIN RETRIES'],
        },
        'PUK RETRIED': {
            value: remainingPUK ?? 'Unknown',
            ...docs['PUK RETRIES'],
        },
        'PIN2 RETRIED': {
            value: remainingPIN2 ?? 'Unknown',
            ...docs['PIN2 RETRIES'],
        },
        'PUK2 RETRIED': {
            value: remainingPUK2 ?? 'Unknown',
            ...docs['PUK2 RETRIES'],
        },
    };

    return (
        <DashboardCard
            key="dashboard-sim-card"
            title="Sim"
            iconName="mdi-sim"
            fields={fields}
        />
    );
};
