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
} from '../../tracingEvents/dashboardSlice';
import { PowerSavingModeValues } from '../../tracingEvents/types';
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
        return `${values.bitmask}`;
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
        'REQUESTED ACTIVE TIMER (T3324)': {
            value: formatPSMValuesToString(requested?.T3324),
        },
        'GRANTED ACTIVE TIMER (T3324)': {
            value: formatPSMValuesToString(granted?.T3324),
        },
        'REQUESTED PERIODIC TAU (T3412 EXTENDED)': {
            value: formatPSMValuesToString(requested?.T3412Extended),
        },
        'GRANTED PERIODIC TAU (T3412 EXTENDED)': {
            value: formatPSMValuesToString(granted?.T3412Extended),
        },
        'GRANTED PERIODIC TAU (T3412 / LEGACY)': {
            value: formatPSMValuesToString(granted?.T3412),
        },
        'POWER SAVING MODE STATE (GRANTED)': {
            value: granted?.state?.toUpperCase() ?? 'OFF',
        },
        'TAU TRIGGERED': {
            value: TAUTriggered ?? 'Unknown',
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