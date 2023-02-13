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
        'Trace State Operation': { value: xModemTraceOperation ?? 'Unknown', commands: ['AT%XMODEMTRACE'] },
        'Trace State Set ID': { value: xModemTraceSetID ?? 'Unknown', commands: ['AT%XMODEMTRACE'] },
        'LTE-M Support': { value: parseSupportedValue(modemSupportLTEM), commands: ['AT%XSYSTEMMODE'] },
        'NB-IoT Support': { value: parseSupportedValue(modemSupportNBIoT), commands: ['AT%XSYSTEMMODE'] },
        'GNSS Support': { value: parseSupportedValue(modemSupportGNSS), commands: ['AT%XSYSTEMMODE'] },
        'Preferred Bearer': { value: parsePreferredBearer(modemSystemPreference), commands: ['AT%XSYSTEMMODE'] },
        'Network Status Notifications': { value: parseNotificationStatus(
            networkStatusNotifications
        ), commands: ['AT+CEREG'] },
        'Signaling Connecting Status Notifications': { value: parseNotificationStatus(
            signalingConnectionStatusNotifications
        ), commands: ['AT+CSCON'] },

        'Connection Evaluation Result': { value: conevalResult ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'RRC State': { value: rrcState ?? 'Unknown', commands: ['AT%CONEVAL', 'AT+CSCON'] },
        'Energy Estimate': { value: conevalEnergyEstimate ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'Signal Quality (RSRP)': { value: signalQuality?.rsrp ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'Signal Quality (RSRQ)': { value: signalQuality?.rsrq ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'Signal Quality (SNR)': { value: signalQuality?.snr ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'Cell ID': { value: cellID ?? 'Unknown', commands: ['AT%CONEVAL'] },
        PLMN: { value: plmn ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'Physical Cell ID': { value: physicalCellID ?? 'Unknown', commands: ['AT%CONEVAL'] },
        EARFCN: { value: earfcn ?? 'Unknown', commands: ['AT%CONEVAL'] },
        Band: { value: band ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'TAU Triggered': { value: TAUTriggered ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'CONEVAL Cell Evaluation Level':
        { value: conevalCellEvaluationLevel ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'CONEVAL TX Power': { value: conevalTXPower ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'CONEVAL TX Repetitions': { value: conevalTXRepetitions ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'CONEVAL RX Repetitions': { value: conevalRXRepetitions ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'CONEVAL DL Path Loss': { value: conevalDLPathLoss ?? 'Unknown', commands: ['AT%CONEVAL'] },
        'AcT State': { value: AcTState ?? 'Unknown', commands: ['AT+CEDRXRDP'] },
        /* eslint-disable camelcase */
        'Requested eDRX': { value: requested_eDRX_value ?? 'Unknown', commands: ['AT+CEDRXRDP'] },
        'NW Provided eDRX': { value: NW_provided_eDRX_value ?? 'Unknown', commands: ['AT+CEDRXRDP'] },
        'Paging Time Window': { value: pagingTimeWindow ?? 'Unknown', commands: ['AT+CEDRXRDP'] },

        'Network Time Notifications': { value: parseNotificationStatus(
            networkTimeNotifications
        ), commands: ['AT%XTIME'] },
        'Local Time Zone': { value: networkTimeNotification?.localTimeZone ?? 'Unknown', commands: ['AT%XTIME'] },
        'Universal Time': { value: networkTimeNotification?.universalTime ?? 'Unknown', commands: ['AT%XTIME'] },
        'Daylight Saving Time': { value: 
            networkTimeNotification?.daylightSavingTime ?? 'Unknown', commands: ['AT%XTIME'] },
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
