/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { DocumentationKeys } from '../../../features/tracingEvents/at';
import { getPowerSavingMode } from '../../../features/tracingEvents/dashboardSlice';
import { PowerSavingModeValues } from '../../../features/tracingEvents/types';
import DashboardCard from './DashboardCard';

const formatPSMValuesToString = (
    values: PowerSavingModeValues | undefined
): string => {
    if (values === undefined) {
        return 'Unknown';
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

    const fields = {
        'Requested Periodic TAU (T3412 extended)': {
            value: formatPSMValuesToString(requested?.T3412Extended),
            commands: ['AT+CPSMS'] as DocumentationKeys[],
        },
        'Requested Active Timer (T3324)': {
            value: formatPSMValuesToString(requested?.T3324),
            commands: ['AT+CPSMS'] as DocumentationKeys[],
        },

        // Could be displayed if user toggles an Advanced option?
        // 'T3324 Extended': requested.T3324_extended ?? 'Unknown',
        // T3402: requested.T3402 ?? 'Unknown',
        // 'T3402 Extended': requested.T3402_extended ?? 'Unknown',

        // GRANTED VALUES
        'Granted Periodic TAU (T3412 extended)': {
            value: formatPSMValuesToString(granted?.T3412Extended),
            commands: [],
        },
        'Granted Active Timer (T3324)': {
            value: formatPSMValuesToString(granted?.T3324),
            commands: [],
        },
        // T3412: requested.T3412 ?? undefined,
    };

    return (
        <DashboardCard
            title="Power Saving Mode"
            iconName="mdi-lightning-bolt-circle"
            fields={fields}
        />
    );
};
