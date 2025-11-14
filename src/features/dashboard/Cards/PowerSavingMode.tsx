/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { secondsToDhms } from '../../../common/converters';
import {
    eDrxPagingTimeWindowToSeconds,
    eDrxValueToSeconds,
    isDeactivated,
} from '../../../common/powerSavingMode';
import {
    getDashboardState,
    getPowerSavingMode,
} from '../../tracingEvents/dashboardSlice';
import { PowerSavingModeValues } from '../../tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

export default () => {
    const { TAUTriggered } = useSelector(getDashboardState);
    const { requested, granted } = useSelector(getPowerSavingMode) ?? {
        requested: undefined,
        granted: undefined,
    };
    const { eDrxLteM, eDrxNbIot } = useSelector(getDashboardState);

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

        'LTE-M REQUESTED EDRX': {
            value: formateDrxValuesToString(eDrxLteM?.requestedValue),
        },
        'LTE-M NW PROVIDED EDRX': {
            value: formateDrxValuesToString(eDrxLteM?.nwProvidedValue),
        },
        'LTE-M PAGING TIME WINDOW': {
            value: formatPagingTimeWindow(
                eDrxLteM?.nwProvidedValue,
                eDrxLteM?.AcT ?? 4,
            ),
        },

        'NB-IOT REQUESTED EDRX': {
            value: formateDrxValuesToString(eDrxNbIot?.requestedValue),
        },
        'NB-IOT NW PROVIDED EDRX': {
            value: formateDrxValuesToString(eDrxNbIot?.nwProvidedValue),
        },
        'NB-IOT PAGING TIME WINDOW': {
            value: formatPagingTimeWindow(
                eDrxNbIot?.nwProvidedValue,
                eDrxNbIot?.AcT ?? 4,
            ),
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
            title="Power Saving Features"
            iconName="mdi-lightning-bolt-circle"
            fields={fields}
        />
    );
};

const formatPSMValuesToString = (
    values: PowerSavingModeValues | undefined,
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

const formateDrxValuesToString = (bitmask: string | undefined) => {
    if (!bitmask) {
        return 'Unknown';
    }

    const seconds = eDrxValueToSeconds(bitmask);
    if (seconds >= 0) {
        return `${seconds}s (${bitmask})`;
    }

    return `${bitmask}`;
};

const formatPagingTimeWindow = (
    bitmask: string | undefined,
    AcT: 0 | 4 | 5,
) => {
    if (!bitmask) {
        return 'Unknown';
    }

    const seconds = eDrxPagingTimeWindowToSeconds(bitmask, AcT);
    if (seconds >= 0) {
        return `${seconds}s (${bitmask})`;
    }

    return `${bitmask}`;
};
