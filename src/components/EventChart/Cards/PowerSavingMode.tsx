/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getPowerSavingMode } from '../../../features/tracingEvents/dashboardSlice';
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
    const { requested, granted } = useSelector(getPowerSavingMode) ?? {
        requested: undefined,
        granted: undefined,
    };

    const fields: DashboardCardFields = {
        'Requested Active Timer(T3324)': {
            value: formatPSMValuesToString(requested?.T3324),
            commands: ['AT+CPSMS'] as const,
        },
        'Granted Active Timer(T3324)': {
            value: formatPSMValuesToString(granted?.T3324),
            commands: ['AT+CEREG', 'AT%XMONITOR'],
        },
        'Requested Periodic TAU(T3412 extended)': {
            value: formatPSMValuesToString(requested?.T3412Extended),
            commands: ['AT+CPSMS'] as const,
        },
        'Granted Periodic TAU(T3412 extended)': {
            value: formatPSMValuesToString(granted?.T3412Extended),
            commands: ['AT+CEREG', 'AT%XMONITOR'],
        },
        'Granted Periodic TAU(T3412 / legacy)': {
            value: formatPSMValuesToString(granted?.T3412),
            commands: ['AT+CEREG', 'AT%XMONITOR'],
        },
        'Power Saving Mode State (Granted)': {
            value: granted?.state?.toUpperCase() ?? 'OFF',
            commands: ['AT+CEREG', 'AT%XMONITOR'],
        },
    };

    return (
        <DashboardCard
            title="Power Saving Mode"
            iconName="mdi-lightning-bolt-circle"
            fields={fields}
        />
    );
};
