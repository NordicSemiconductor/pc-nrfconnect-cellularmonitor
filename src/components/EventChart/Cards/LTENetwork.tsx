/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { documentation } from '../../../../resources/docs/dashboard_fields';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import type {
    AcTState,
    NetworkStatusNotifications,
    SignalingConnectionStatusNotifications,
} from '../../../features/tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

const { LTENetwork: docs } = documentation;

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
        plmnMode,
        plmnFormat,
        plmn,
        physicalCellID,
        band,
        conevalCoverageEnhancementLevel,
        conevalTXPower,
        conevalTXRepetitions,
        conevalRXRepetitions,
        conevalDLPathLoss,
    } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        ACT: {
            value:
                AcTState !== undefined ? parseModeFromAcT(AcTState) : 'Unknown',
            ...docs.AcT,
        },
        'ACT STATE': {
            value: AcTState ?? 'Unknown',
            ...docs['ACT STATE'],
        },
        // TODO: need to look into how to properly get correct value for this
        'RRC STATE': {
            value: parseRRCState(rrcState),
            ...docs['RRC STATE'],
        },
        'NETWORK TYPE': {
            value: networkType ?? 'Unknown',
            ...docs['NETWORK TYPE'],
        },
        MNC: {
            value: parseMCC(mnc, mncCode),
            ...docs.MNC,
        },
        MCC: {
            value: parseMCC(mcc, mccCode),
            ...docs.MCC,
        },
        EARFCN: {
            value: earfcn ?? 'Unknown',
            ...docs.EARFCN,
        },
        RSRP: {
            value: signalQuality?.rsrp_decibel ?? 'Unknown',
            ...docs.RSRP,
        },
        RSRQ: {
            value: signalQuality?.rsrq_decibel ?? 'Unknown',
            ...docs.RSRQ,
        },
        // TODO: Do we need to change to decibel, and then replace the two above?
        'SIGNAL QUALITY (RSRP)': {
            value: signalQuality?.rsrp ?? 'Unknown',
            ...docs['SIGNAL QUALITY (RSRP)'],
        },
        'SIGNAL QUALITY (RSRQ)': {
            value: signalQuality?.rsrq ?? 'Unknown',
            ...docs['SIGNAL QUALITY (RSRQ)'],
        },
        'SIGNAL QUALITY (SNR)': {
            value: signalQuality?.snr ?? 'Unknown',
            ...docs['SIGNAL QUALITY (SNR)'],
        },
        'NETWORK STATUS NOTIFICATIONS': {
            value: parseNotificationStatus(networkStatusNotifications),
            ...docs['NETWORK STATUS NOTIFICATIONS'],
        },
        'SIGNALING CONNECTING STATUS NOTIFICATIONS': {
            value: parseNotificationStatus(
                signalingConnectionStatusNotifications
            ),
            ...docs['SIGNALING CONNECTING STATUS NOTIFICATIONS'],
        },
        // TODO: To be removed?
        'ACTIVITY STATUS': {
            value: activityStatus ?? 'Unknown',
            ...docs['ACTIVITY STATUS'],
        },
        'EPS NETWORK REGISTRATION STATUS': {
            value: networkStatus ?? 'Unknown',
            ...docs['EPS NETWORK REGISTRATION STATUS'],
        },
        /* eslint-disable camelcase */
        'REQUESTED EDRX': {
            value: requested_eDRX_value ?? 'Unknown',
            ...docs['REQUESTED EDRX'],
        },
        'NW PROVIDED EDRX': {
            value: NW_provided_eDRX_value ?? 'Unknown',
            ...docs['NW PROVIDED EDRX'],
        },
        'PAGING TIME WINDOW': {
            value: pagingTimeWindow ?? 'Unknown',
            ...docs['PAGING TIME WINDOW'],
        },

        'NETWORK TIME NOTIFICATIONS': {
            value: parseNotificationStatus(networkTimeNotifications),
            ...docs['NETWORK TIME NOTIFICATIONS'],
        },
        'LOCAL TIME ZONE': {
            value: networkTimeNotification?.localTimeZone ?? 'Unknown',
            ...docs['LOCAL TIME ZONE'],
        },
        'UNIVERSAL TIME': {
            value: networkTimeNotification?.universalTime ?? 'Unknown',
            ...docs['UNIVERSAL TIME'],
        },
        'DAYLIGHT SAVING TIME': {
            value: networkTimeNotification?.daylightSavingTime ?? 'Unknown',
            ...docs['DAYLIGHT SAVING TIME'],
        },
        'CONNECTION EVALUATION RESULT': {
            value: conevalResult ?? 'Unknown',
            ...docs['CONNECTION EVALUATION RESULT'],
        },
        'ENERGY ESTIMATE': {
            value: conevalEnergyEstimate ?? 'Unknown',
            ...docs['ENERGY ESTIMATE'],
        },
        'CELL ID': {
            value: cellID ?? 'Unknown',
            ...docs['CELL ID'],
        },
        PLMN: {
            value: plmn ?? 'Unknown',
            ...docs.PLMN,
        },
        'PLMN MODE': {
            value: plmnMode ?? 'Unknown',
            ...docs['PLMN MODE'],
        },
        'PLMN FORMAT': {
            value: plmnFormat ?? 'Unknown',
            ...docs['PLMN FORMAT'],
        },
        // TODO: Need to look into how to display available PLMNS
        // 'AVAILABLE PLMNS': {
        //     value: availablePlmns ?? 'Unknown',
        //     commands: ['AT+COPS'],
        // },
        'PHYSICAL CELL ID': {
            value: physicalCellID ?? 'Unknown',
            ...docs['PHYSICAL CELL ID'],
        },
        'CURRENT BAND': {
            value: band ?? 'Unknown',
            ...docs['CURRENT BAND'],
        },
        'COVERAGE ENHANCEMENT LEVEL': {
            value: conevalCoverageEnhancementLevel ?? 'Unknown',
            ...docs['COVERAGE ENHANCEMENT LEVEL'],
        },
        'CONEVAL TX POWER': {
            value: conevalTXPower ?? 'Unknown',
            ...docs['CONEVAL TX POWER'],
        },
        'CONEVAL TX REPETITIONS': {
            value: conevalTXRepetitions ?? 'Unknown',
            ...docs['CONEVAL TX REPETITIONS'],
        },
        'CONEVAL RX REPETITIONS': {
            value: conevalRXRepetitions ?? 'Unknown',
            ...docs['CONEVAL RX REPETITIONS'],
        },
        'CONEVAL DL PATH LOSS': {
            value: conevalDLPathLoss ?? 'Unknown',
            ...docs['CONEVAL DL PATH LOSS'],
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

const parseRRCState = (rrcState: number | undefined) => {
    if (rrcState === undefined) return 'Unknown';
    if (rrcState === 0) return 'RRC IDLE';
    if (rrcState === 1) return 'RRC CONNECTED';

    return '' as never;
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
