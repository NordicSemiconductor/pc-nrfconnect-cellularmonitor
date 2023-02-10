/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import {
    NetworkStatusNotifications,
    SignalingConnectionStatusNotifications,
} from '../../../features/tracingEvents/types';
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

        // +CSCON Notifications
        signalingConnectionStatusNotifications,

        // %CONEVAL
        conevalResult,
        rrcState,
        conevalEnergyEstimate,
        signalQuality,
        cellID,
        plmn,
        physicalCellID,
        earfcn,
        band,
        TAUTriggered,
        conevalCellEvaluationLevel,
        conevalTXPower,
        conevalTXRepetitions,
        conevalRXRepetitions,
        conevalDLPathLoss,

        // +CEDRXRDP
        /* eslint-disable camelcase */
        AcTState,
        requested_eDRX_value,
        NW_provided_eDRX_value,
        pagingTimeWindow,

        // %XTIME
        networkTimeNotifications,
        networkTimeNotification,
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

        'Network Status Notifications': parseNotificationStatus(
            networkStatusNotifications
        ),
        'Signaling Connecting Status Notifications': parseNotificationStatus(
            signalingConnectionStatusNotifications
        ),

        'Connection Evaluation Result': conevalResult ?? 'Unknown',
        'RRC State': rrcState ?? 'Unknown',
        'Energy Estimate': conevalEnergyEstimate ?? 'Unknown',
        'Signal Quality (RSRP)': signalQuality?.rsrp ?? 'Unknown',
        'Signal Quality (RSRQ)': signalQuality?.rsrq ?? 'Unknown',
        'Signal Quality (SNR)': signalQuality?.snr ?? 'Unknown',
        'Cell ID': cellID ?? 'Unknown',
        PLMN: plmn ?? 'Unknown',
        'Physical Cell ID': physicalCellID ?? 'Unknown',
        EARFCN: earfcn ?? 'Unknown',
        Band: band ?? 'Unknown',
        'TAU Triggered': TAUTriggered ?? 'Unknown',
        'CONEVAL Cell Evaluation Level':
            conevalCellEvaluationLevel ?? 'Unknown',
        'CONEVAL TX Power': conevalTXPower ?? 'Unknown',
        'CONEVAL TX Repetitions': conevalTXRepetitions ?? 'Unknown',
        'CONEVAL RX Repetitions': conevalRXRepetitions ?? 'Unknown',
        'CONEVAL DL Path Loss': conevalDLPathLoss ?? 'Unknown',
        'AcT State': AcTState ?? 'Unknown',
        /* eslint-disable camelcase */
        'Requested eDRX': requested_eDRX_value ?? 'Unknown',
        'NW Provided eDRX': NW_provided_eDRX_value ?? 'Unknown',
        'Paging Time Window': pagingTimeWindow ?? 'Unknown',

        'Network Time Notifications': parseNotificationStatus(
            networkTimeNotifications
        ),
        'Local Time Zone': networkTimeNotification?.localTimeZone ?? 'Unknown',
        'Universal Time': networkTimeNotification?.universalTime ?? 'Unknown',
        'Daylight Saving Time':
            networkTimeNotification?.daylightSavingTime ?? 'Unknown',
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

const parseNotificationStatus = (
    notification:
        | NetworkStatusNotifications
        | SignalingConnectionStatusNotifications
        | (0 | 1)
) => {
    if (notification != null) {
        if (notification === 0) return 'Unsubscribed';

        return `Subscribed with value: ${notification}`;
    }

    return 'Unknown';
};
