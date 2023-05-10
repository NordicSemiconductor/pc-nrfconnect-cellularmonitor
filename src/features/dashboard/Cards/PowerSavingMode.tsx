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
    // eslint-disable-next-line camelcase
    const { requested_eDRX_value, NW_provided_eDRX_value, pagingTimeWindow } =
        useSelector(getDashboardState);
    useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        'REQUESTED ACTIVE TIMER': {
            value: formatPSMValuesToString(requested?.T3324),
        },
        'REQUESTED PERIODIC TAU': {
            value: formatPSMValuesToString(requested?.T3412Extended),
        },
        'PROVIDED ACTIVE TIMER': {
            value: formatPSMValuesToString(granted?.T3324),
        },
        'PROVIDED PERIODIC TAU': {
            value: formatPSMValuesToString(granted?.T3412Extended),
        },
        'LEGACY PROVIDED PERIODIC TAU': {
            value: formatPSMValuesToString(granted?.T3412),
        },
        'POWER SAVING MODE STATE (PROVIDED)': {
            value: granted?.state?.toUpperCase() ?? 'OFF',
        },
        'TAU TRIGGERED': {
            value: TAUTriggered ?? 'Unknown',
        },
        /* eslint-disable camelcase */
        'REQUESTED EDRX': {
            value: requested_eDRX_value ?? 'Unknown',
        },
        'NW PROVIDED EDRX': {
            value: NW_provided_eDRX_value ?? 'Unknown',
        },
        'PAGING TIME WINDOW': {
            value: pagingTimeWindow ?? 'Unknown',
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
