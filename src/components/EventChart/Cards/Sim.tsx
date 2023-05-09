/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

export default () => {
    const {
        iccid,
        uiccInitialised,
        uiccInitialisedErrorCause,
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
        'UICC STATUS': {
            value: uiccStatus(uiccInitialised),
        },
        IMSI: {
            value: imsi ?? 'Unknown',
        },
        OPERATOR: {
            value: operatorFullName ?? 'Unknown',
        },
        MANUFACTURER: {
            value: manufacturer ?? 'Unknown',
        },
        ICCID: {
            value: iccid ?? 'Unknown',
        },
        PIN: { value: pin },
        'PIN RETRIES': {
            value: remainingPIN ?? 'Unknown',
        },
        'PUK RETRIES': {
            value: remainingPUK ?? 'Unknown',
        },
        'PIN2 RETRIES': {
            value: remainingPIN2 ?? 'Unknown',
        },
        'PUK2 RETRIES': {
            value: remainingPUK2 ?? 'Unknown',
        },
    };

    if (uiccInitialisedErrorCause && uiccInitialised === false) {
        Object.assign(fields, {
            'UICC FAIL CAUSE': { value: uiccInitialisedErrorCause },
        });
    }

    return (
        <DashboardCard
            key="dashboard-sim-card"
            title="Sim"
            iconName="mdi-sim"
            fields={fields}
        />
    );
};

const uiccStatus = (status?: boolean) => {
    if (status === undefined) return 'Unknown';

    // string status according to documentation on infocenter
    return status ? 'Initialization OK' : 'Not Initialized';
};
