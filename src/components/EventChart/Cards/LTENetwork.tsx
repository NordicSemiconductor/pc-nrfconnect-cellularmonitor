/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import type {
    AcTState,
    NetworkStatusNotifications,
    RRCState,
    SignalingConnectionStatusNotifications,
} from '../../../features/tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

type RRCStateFlag = '🟡' | '🟢' | '🔴';

const getRRCStateColor = (
    state: RRCState | undefined
): `${RRCStateFlag}${string}` => {
    switch (state) {
        case 0:
            return '🟡 Idle';
        case 1:
            return '🟢 Connected';
        default:
            return '🔴 Unknown';
    }
};

export default () => {
    const {
        AcTState,
        rrcState,
        signalQuality,
        networkStatus,
        activityStatus,
        mcc,
        mccCode,
        mnc,
        mncCode,
        networkType,
        earfcn,

        // +CEREG Notifications
        networkStatusNotifications,

        // +CSCON Notifications
        signalingConnectionStatusNotifications,

        // +CEDRXRDP
        /* eslint-disable camelcase */
        requested_eDRX_value,
        NW_provided_eDRX_value,
        pagingTimeWindow,

        // %XTIME
        networkTimeNotifications,
        networkTimeNotification,

        // %CONEVAL
        conevalResult,
        conevalEnergyEstimate,
        cellID,
        plmn,
        physicalCellID,
        band,
        conevalCellEvaluationLevel,
        conevalTXPower,
        conevalTXRepetitions,
        conevalRXRepetitions,
        conevalDLPathLoss,
    } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        MODE: {
            value:
                AcTState !== undefined ? parseModeFromAcT(AcTState) : 'Unknown',
            commands: ['AT+CEREG', 'AT%XMONITOR', 'AT+CEDRXRDP'],
        },
        // TODO: need to look into how to properly get correct value for this
        'RRC STATE': {
            value: getRRCStateColor(rrcState),
            commands: ['AT%CONEVAL', 'AT+CSCON'],
        },
        'ACT STATE': {
            value: AcTState ?? 'Unknown',
            commands: ['AT+CEDRXRDP'],
        },
        'NETWORK TYPE': { value: networkType ?? 'Unknown', commands: [] },
        MNC: { value: parseMCC(mnc, mncCode), commands: [] },
        EARFCN: {
            value: earfcn ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        MCC: { value: parseMCC(mcc, mccCode), commands: [] },
        RSRP: {
            value: signalQuality?.rsrp_decibel ?? 'Unknown',
            commands: ['AT%CESQ'],
        },
        RSRQ: {
            value: signalQuality?.rsrq_decibel ?? 'Unknown',
            commands: ['AT%CESQ'],
        },
        // TODO: Do we need to change to decibel, and then replace the two above?
        'SIGNAL QUALITY (RSRP)': {
            value: signalQuality?.rsrp ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'SIGNAL QUALITY (RSRQ)': {
            value: signalQuality?.rsrq ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'SIGNAL QUALITY (SNR)': {
            value: signalQuality?.snr ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'NETWORK STATUS NOTIFICATIONS': {
            value: parseNotificationStatus(networkStatusNotifications),
            commands: ['AT+CEREG'],
        },
        'SIGNALING CONNECTING STATUS NOTIFICATIONS': {
            value: parseNotificationStatus(
                signalingConnectionStatusNotifications
            ),
            commands: ['AT+CSCON'],
        },
        // TODO: To be removed?
        'ACTIVITY STATUS': {
            value: activityStatus ?? 'Unknown',
            commands: ['AT+CPAS'],
        },
        STATUS: { value: networkStatus ?? 'Unknown', commands: [] },
        /* eslint-disable camelcase */
        'REQUESTED EDRX': {
            value: requested_eDRX_value ?? 'Unknown',
            commands: ['AT+CEDRXRDP'],
        },
        'NW PROVIDED EDRX': {
            value: NW_provided_eDRX_value ?? 'Unknown',
            commands: ['AT+CEDRXRDP'],
        },
        'PAGING TIME WINDOW': {
            value: pagingTimeWindow ?? 'Unknown',
            commands: ['AT+CEDRXRDP'],
        },

        'NETWORK TIME NOTIFICATIONS': {
            value: parseNotificationStatus(networkTimeNotifications),
            commands: ['AT%XTIME'],
        },
        'LOCAL TIME ZONE': {
            value: networkTimeNotification?.localTimeZone ?? 'Unknown',
            commands: ['AT%XTIME'],
        },
        'UNIVERSAL TIME': {
            value: networkTimeNotification?.universalTime ?? 'Unknown',
            commands: ['AT%XTIME'],
        },
        'DAYLIGHT SAVING TIME': {
            value: networkTimeNotification?.daylightSavingTime ?? 'Unknown',
            commands: ['AT%XTIME'],
        },
        'CONNECTION EVALUATION RESULT': {
            value: conevalResult ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'ENERGY ESTIMATE': {
            value: conevalEnergyEstimate ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'CELL ID': {
            value: cellID ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        PLMN: {
            value: plmn ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'PHYSICAL CELL ID': {
            value: physicalCellID ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        BAND: {
            value: band ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL CELL EVALUATION LEVEL': {
            value: conevalCellEvaluationLevel ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL TX POWER': {
            value: conevalTXPower ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL TX REPETITIONS': {
            value: conevalTXRepetitions ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL RX REPETITIONS': {
            value: conevalRXRepetitions ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL DL PATH LOSS': {
            value: conevalDLPathLoss ?? 'Unknown',
            commands: ['AT%CONEVAL'],
        },
    };
    return (
        <DashboardCard
            key="dashboard-LTE-card"
            title="LTE Network"
            iconName="mdi-access-point-network"
            fields={fields}
        />
    );
};

const parseModeFromAcT = (AcTState: AcTState) => {
    if (AcTState === 0) return 'NOT CONNECTED';
    if (AcTState === 4 || AcTState === 7) {
        return 'LTE-M';
    }
    if (AcTState === 5 || AcTState === 9) {
        return 'NB-IoT';
    }

    return null as never;
};

const parseMCC = (mcc: string | undefined, mccCode: number | undefined) => {
    let result = '';
    if (mccCode !== undefined) {
        result += `${mccCode}`;
    }
    if (mcc !== undefined) {
        result += ` ${mcc}`;
    }
    if (result === '') return 'Unknown';
    return result.trim();
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
