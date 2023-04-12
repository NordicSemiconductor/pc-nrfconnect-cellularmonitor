/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import {
    getDashboardState,
    getPowerSavingMode,
} from '../../../features/tracingEvents/dashboardSlice';
import { PowerSavingModeValues } from '../../../features/tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

const formatPSMValuesToString = (
    values: PowerSavingModeValues | undefined
): string => {
    if (values === undefined) {
        return 'Unknown';
    }

    if (values.bitmask === '11100000') {
        return `Deactivated = ${values.bitmask}`;
    }
    if (values.unit && values.value) {
        return `${values.value} ${values.unit} = ${values.bitmask}`;
    }
    return `${values.bitmask}`;
};

export default () => {
    const { TAUTriggered } = useSelector(getDashboardState);
    const { requested, granted } = useSelector(getPowerSavingMode) ?? {
        requested: undefined,
        granted: undefined,
    };

    const fields: DashboardCardFields = {
        'REQUESTED ACTIVE TIMER(T3324)': {
            value: formatPSMValuesToString(requested?.T3324),
            commands: ['AT+CPSMS'] as const,
        },
        'GRANTED ACTIVE TIMER(T3324)': {
            value: formatPSMValuesToString(granted?.T3324),
            commands: ['AT+CEREG', 'AT%XMONITOR'],
        },
        'REQUESTED PERIODIC TAU(T3412 EXTENDED)': {
            value: formatPSMValuesToString(requested?.T3412Extended),
            commands: ['AT+CPSMS'] as const,
        },
        'GRANTED PERIODIC TAU(T3412 EXTENDED)': {
            value: formatPSMValuesToString(granted?.T3412Extended),
            commands: ['AT+CEREG', 'AT%XMONITOR'],
        },
        'GRANTED PERIODIC TAU(T3412 / LEGACY)': {
            value: formatPSMValuesToString(granted?.T3412),
            commands: ['AT+CEREG', 'AT%XMONITOR'],
        },
        'POWER SAVING MODE STATE (GRANTED)': {
            value: granted?.state?.toUpperCase() ?? 'OFF',
            commands: ['AT+CEREG', 'AT%XMONITOR'],
        },
        'TAU TRIGGERED': {
            value: TAUTriggered ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
    };

    return (
        <DashboardCard
            key="dashboard-psm-card"
            title="Power Saving Mode"
            iconName="mdi-lightning-bolt-circle"
            fields={fields}
        />
    );
};
