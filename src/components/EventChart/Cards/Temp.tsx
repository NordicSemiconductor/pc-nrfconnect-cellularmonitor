/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import { NetworkStatusNotifications } from '../../../features/tracingEvents/types';
import DashboardCard from './DashboardCard';

export default () => {
    const {
        // xModemTrace
        xModemTraceOperation,
        xModemTraceSetID,

        // xSystemMode
        modemSupportLTEM,
        modemSupportNBIoT,
        modemSupportGNSS,
        modemSystemPreference,

        // +CEREG Notifications
        networkStatusNotifications,
    } = useSelector(getDashboardState);

    const parseSupportedValue = (supported: boolean | undefined) => {
        if (supported === undefined) return 'Unknown';

        return supported ? 'Yes' : 'No';
    };

    const parsePreferredBearer = (preferred: number) => {
        switch (preferred) {
            case 0:
                return 'No Preference';
            case 1:
                return 'LTE-M';
            case 2:
                return 'NB-IoT';
            case 3:
                return 'Network Selection (LTE-M)';
            case 4:
                return 'Network Selection (LTE-M)';
            default:
                return 'Unknown';
        }
    };

    const fields = {
        'Trace State Operation': xModemTraceOperation ?? 'Unknown',
        'Trace State Set ID': xModemTraceSetID ?? 'Unknown',

        'LTE-M Support': parseSupportedValue(modemSupportLTEM),
        'NB-IoT Support': parseSupportedValue(modemSupportNBIoT),
        'GNSS Support': parseSupportedValue(modemSupportGNSS),
        'Preferred Bearer': parsePreferredBearer(modemSystemPreference),

        'Network Status Notifications': parseNetworkStatusNotifications(
            networkStatusNotifications
        ),
    };

    return (
        <DashboardCard
            title="Temp Card"
            iconName="mdi-cellphone-wireless"
            information="This card is used as temporary card until we get some feedback on where values should actually be placed."
            fields={fields}
        />
    );
};

const parseNetworkStatusNotifications = (
    notification: NetworkStatusNotifications
) => {
    if (notification != null) {
        if (notification === 0) return 'Unsubscribed';

        return `Subscribed with value: ${notification}`;
    }

    return 'Unknown';
};
