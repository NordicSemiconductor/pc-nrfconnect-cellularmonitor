/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { DocumentationKeys } from '../../../features/tracingEvents/at';
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
        'Trace State Operation': {
            value: xModemTraceOperation ?? 'Unknown',
            commands: ['AT%XMODEMTRACE'] as DocumentationKeys[],
        },
        'Trace State Set ID': {
            value: xModemTraceSetID ?? 'Unknown',
            commands: ['AT%XMODEMTRACE'] as DocumentationKeys[],
        },
        'LTE-M Support': {
            value: parseSupportedValue(modemSupportLTEM),
            commands: ['AT%XSYSTEMMODE'] as DocumentationKeys[],
        },
        'NB-IoT Support': {
            value: parseSupportedValue(modemSupportNBIoT),
            commands: ['AT%XSYSTEMMODE'] as DocumentationKeys[],
        },
        'GNSS Support': {
            value: parseSupportedValue(modemSupportGNSS),
            commands: ['AT%XSYSTEMMODE'] as DocumentationKeys[],
        },
        'Preferred Bearer': {
            value: parsePreferredBearer(modemSystemPreference),
            commands: ['AT%XSYSTEMMODE'] as DocumentationKeys[],
        },
        'Network Status Notifications': {
            value: parseNotificationStatus(networkStatusNotifications),
            commands: ['AT+CEREG'] as DocumentationKeys[],
        },
        'Signaling Connecting Status Notifications': {
            value: parseNotificationStatus(
                signalingConnectionStatusNotifications
            ),
            commands: ['AT+CSCON'] as DocumentationKeys[],
        },

        'Connection Evaluation Result': {
            value: conevalResult ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'RRC State': {
            value: rrcState ?? 'Unknown',
            commands: ['AT%CONEVAL', 'AT+CSCON'] as DocumentationKeys[],
        },
        'Energy Estimate': {
            value: conevalEnergyEstimate ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'Signal Quality (RSRP)': {
            value: signalQuality?.rsrp ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'Signal Quality (RSRQ)': {
            value: signalQuality?.rsrq ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'Signal Quality (SNR)': {
            value: signalQuality?.snr ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'Cell ID': {
            value: cellID ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        PLMN: {
            value: plmn ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'Physical Cell ID': {
            value: physicalCellID ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        EARFCN: {
            value: earfcn ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        Band: {
            value: band ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'TAU Triggered': {
            value: TAUTriggered ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'CONEVAL Cell Evaluation Level': {
            value: conevalCellEvaluationLevel ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'CONEVAL TX Power': {
            value: conevalTXPower ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'CONEVAL TX Repetitions': {
            value: conevalTXRepetitions ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'CONEVAL RX Repetitions': {
            value: conevalRXRepetitions ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'CONEVAL DL Path Loss': {
            value: conevalDLPathLoss ?? 'Unknown',
            commands: ['AT%CONEVAL'] as DocumentationKeys[],
        },
        'AcT State': {
            value: AcTState ?? 'Unknown',
            commands: ['AT+CEDRXRDP'] as DocumentationKeys[],
        },
        /* eslint-disable camelcase */
        'Requested eDRX': {
            value: requested_eDRX_value ?? 'Unknown',
            commands: ['AT+CEDRXRDP'] as DocumentationKeys[],
        },
        'NW Provided eDRX': {
            value: NW_provided_eDRX_value ?? 'Unknown',
            commands: ['AT+CEDRXRDP'] as DocumentationKeys[],
        },
        'Paging Time Window': {
            value: pagingTimeWindow ?? 'Unknown',
            commands: ['AT+CEDRXRDP'] as DocumentationKeys[],
        },

        'Network Time Notifications': {
            value: parseNotificationStatus(networkTimeNotifications),
            commands: ['AT%XTIME'] as DocumentationKeys[],
        },
        'Local Time Zone': {
            value: networkTimeNotification?.localTimeZone ?? 'Unknown',
            commands: ['AT%XTIME'] as DocumentationKeys[],
        },
        'Universal Time': {
            value: networkTimeNotification?.universalTime ?? 'Unknown',
            commands: ['AT%XTIME'] as DocumentationKeys[],
        },
        'Daylight Saving Time': {
            value: networkTimeNotification?.daylightSavingTime ?? 'Unknown',
            commands: ['AT%XTIME'] as DocumentationKeys[],
        },
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
