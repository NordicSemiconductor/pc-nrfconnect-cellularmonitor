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
import DashboardCard, { DashboardCardFields } from './DashboardCard';

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

    const fields: DashboardCardFields = {
        'Trace State Operation': {
            value: xModemTraceOperation ?? 'Unknown',
            commands: ['AT%XMODEMTRACE'] as const,
        },
        'Trace State Set ID': {
            value: xModemTraceSetID ?? 'Unknown',
            commands: ['AT%XMODEMTRACE'] as const,
        },
        'Network Status Notifications': {
            value: parseNotificationStatus(networkStatusNotifications),
            commands: ['AT+CEREG'] as const,
        },
        'Signaling Connecting Status Notifications': {
            value: parseNotificationStatus(
                signalingConnectionStatusNotifications
            ),
            commands: ['AT+CSCON'] as const,
        },

        'Connection Evaluation Result': {
            value: conevalResult ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'RRC State': {
            value: rrcState ?? 'Unknown',
            commands: ['AT%CONEVAL', 'AT+CSCON'] as const,
        },
        'Energy Estimate': {
            value: conevalEnergyEstimate ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'Signal Quality (RSRP)': {
            value: signalQuality?.rsrp ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'Signal Quality (RSRQ)': {
            value: signalQuality?.rsrq ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'Signal Quality (SNR)': {
            value: signalQuality?.snr ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'Cell ID': {
            value: cellID ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        PLMN: {
            value: plmn ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'Physical Cell ID': {
            value: physicalCellID ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        EARFCN: {
            value: earfcn ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        Band: {
            value: band ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'TAU Triggered': {
            value: TAUTriggered ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL Cell Evaluation Level': {
            value: conevalCellEvaluationLevel ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL TX Power': {
            value: conevalTXPower ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL TX Repetitions': {
            value: conevalTXRepetitions ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL RX Repetitions': {
            value: conevalRXRepetitions ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL DL Path Loss': {
            value: conevalDLPathLoss ?? 'Unknown',
            commands: ['AT%CONEVAL'] as const,
        },
        'AcT State': {
            value: AcTState ?? 'Unknown',
            commands: ['AT+CEDRXRDP'] as const,
        },
        /* eslint-disable camelcase */
        'Requested eDRX': {
            value: requested_eDRX_value ?? 'Unknown',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'NW Provided eDRX': {
            value: NW_provided_eDRX_value ?? 'Unknown',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'Paging Time Window': {
            value: pagingTimeWindow ?? 'Unknown',
            commands: ['AT+CEDRXRDP'] as const,
        },

        'Network Time Notifications': {
            value: parseNotificationStatus(networkTimeNotifications),
            commands: ['AT%XTIME'] as const,
        },
        'Local Time Zone': {
            value: networkTimeNotification?.localTimeZone ?? 'Unknown',
            commands: ['AT%XTIME'] as const,
        },
        'Universal Time': {
            value: networkTimeNotification?.universalTime ?? 'Unknown',
            commands: ['AT%XTIME'] as const,
        },
        'Daylight Saving Time': {
            value: networkTimeNotification?.daylightSavingTime ?? 'Unknown',
            commands: ['AT%XTIME'] as const,
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
