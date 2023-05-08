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
    SignalingConnectionStatusNotifications,
} from '../../../features/tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

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
        },
        'ACT STATE': {
            value: AcTState ?? 'Unknown',
        },
        // TODO: need to look into how to properly get correct value for this
        'RRC STATE': {
            value: parseRRCState(rrcState),
        },
        MNC: {
            value:
                mnc || mncCode
                    ? parseMCC(mnc, mncCode)
                    : parsePlmnToMccOrMnc(parsePlmnType.MNC, plmn),
        },
        MCC: {
            value:
                mcc || mccCode
                    ? parseMCC(mcc, mccCode)
                    : parsePlmnToMccOrMnc(parsePlmnType.MCC, plmn),
        },
        EARFCN: {
            value: earfcn ?? 'Unknown',
        },
        RSRP: {
            value: signalQuality?.rsrp_decibel ?? 'Unknown',
        },
        RSRQ: {
            value: signalQuality?.rsrq_decibel ?? 'Unknown',
        },
        // TODO: Do we need to change to decibel, and then replace the two above?
        'SIGNAL QUALITY (RSRP)': {
            value: signalQuality?.rsrp ?? 'Unknown',
        },
        'SIGNAL QUALITY (RSRQ)': {
            value: signalQuality?.rsrq ?? 'Unknown',
        },
        'SIGNAL QUALITY (SNR)': {
            value: signalQuality?.snr ?? 'Unknown',
        },
        'NETWORK STATUS NOTIFICATIONS': {
            value: parseNotificationStatus(networkStatusNotifications),
        },
        'SIGNALING CONNECTING STATUS NOTIFICATIONS': {
            value: parseNotificationStatus(
                signalingConnectionStatusNotifications
            ),
        },
        // TODO: To be removed?
        'ACTIVITY STATUS': {
            value: activityStatus ?? 'Unknown',
        },
        'EPS NETWORK REGISTRATION STATUS': {
            value: networkStatus ?? 'Unknown',
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

        'NETWORK TIME NOTIFICATIONS': {
            value: parseNotificationStatus(networkTimeNotifications),
        },
        'LOCAL TIME ZONE': {
            value: networkTimeNotification?.localTimeZone ?? 'Unknown',
        },
        'UNIVERSAL TIME': {
            value: networkTimeNotification?.universalTime ?? 'Unknown',
        },
        'DAYLIGHT SAVING TIME': {
            value: networkTimeNotification?.daylightSavingTime ?? 'Unknown',
        },
        'CONNECTION EVALUATION RESULT': {
            value: conevalResult ?? 'Unknown',
        },
        'ENERGY ESTIMATE': {
            value: conevalEnergyEstimate ?? 'Unknown',
        },
        'CELL ID': {
            value: cellID ?? 'Unknown',
        },
        PLMN: {
            value: plmn ?? 'Unknown',
        },
        'PLMN MODE': {
            value: plmnMode ?? 'Unknown',
        },
        'PLMN FORMAT': {
            value: plmnFormat ?? 'Unknown',
        },
        // TODO: Need to look into how to display available PLMNS
        // 'AVAILABLE PLMNS': {
        //     value: availablePlmns ?? 'Unknown',
        //     commands: ['AT+COPS'],
        // },
        'PHYSICAL CELL ID': {
            value: physicalCellID ?? 'Unknown',
        },
        'CURRENT BAND': {
            value: band ?? 'Unknown',
        },
        'COVERAGE ENHANCEMENT LEVEL': {
            value: conevalCoverageEnhancementLevel ?? 'Unknown',
        },
        'CONEVAL TX POWER': {
            value: conevalTXPower ?? 'Unknown',
        },
        'CONEVAL TX REPETITIONS': {
            value: conevalTXRepetitions ?? 'Unknown',
        },
        'CONEVAL RX REPETITIONS': {
            value: conevalRXRepetitions ?? 'Unknown',
        },
        'CONEVAL DL PATH LOSS': {
            value: conevalDLPathLoss ?? 'Unknown',
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

enum parsePlmnType {
    MCC = 'MCC',
    MNC = 'MNC',
}
const parsePlmnToMccOrMnc = (type: parsePlmnType, plmn?: string) => {
    if (!plmn) return 'Unknown';
    if (type === parsePlmnType.MCC) {
        return plmn.slice(0, 3);
    }
    if (type === parsePlmnType.MNC) {
        return plmn.slice(3);
    }

    return 'Unknown';
};
