/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { secondsToDhms } from '../../../utils/converters';
import { isDeactivated } from '../../../utils/powerSavingMode';
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
    const { value, unit, bitmask } = values;

    if (bitmask.slice(0, 3) === '111') {
        return `Deactivated (${bitmask})`;
    }
    if (unit === 'seconds' && value != null) {
        return `${secondsToDhms(value)} (${bitmask})`;
    }
    return `${bitmask}`;
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

    // Only display LEGACY PROVIDED PERIODIC TAU when
    // PROVIDED ACTIVE TIMER is not deactivated (if it is PSM is not on)
    // and PROVIDED PERIODIC TAU is deactivated (if it is we rather want to show this)
    // and LEGACY PROVIDED PERIODIC TAU is not deactivated
    const providedActiveTimer = granted?.T3324?.bitmask;
    const providedPeriodicTau = granted?.T3412Extended?.bitmask;
    const providedLegacyPeriodicTau = granted?.T3412?.bitmask;
    if (
        !providedActiveTimer ||
        isDeactivated(providedActiveTimer) ||
        !providedPeriodicTau ||
        !isDeactivated(providedPeriodicTau) ||
        !providedLegacyPeriodicTau ||
        isDeactivated(providedLegacyPeriodicTau)
    ) {
        delete fields['LEGACY PROVIDED PERIODIC TAU'];
    }

    return (
        <DashboardCard
            key="dashboard-psm-card"
            title="Power Saving Mode"
            iconName="mdi-lightning-bolt-circle"
            fields={fields}
        />
    );
};
