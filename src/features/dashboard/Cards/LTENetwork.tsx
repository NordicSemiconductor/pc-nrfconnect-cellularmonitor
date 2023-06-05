/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../tracingEvents/dashboardSlice';
import type { AcTState } from '../../tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

export default () => {
    const {
        AcTState,
        rrcState,
        signalQuality,
        networkStatus,
        operatorInfo,
        earfcn,
        networkTimeNotification,
        // %CONEVAL
        conevalResult,
        conevalEnergyEstimate,
        cellID,
        plmnMode,
        plmnFormat,
        plmn,
        physicalCellID,
        conevalCoverageEnhancementLevel,
        conevalTXPower,
        conevalTXRepetitions,
        conevalRXRepetitions,
        conevalDLPathLoss,
    } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        RRC: {
            value: parseRRCState(rrcState),
        },
        'ACTIVITY STATUS': {
            value: networkStatus ?? 'Unknown',
        },
        ACT: {
            value:
                AcTState !== undefined ? parseModeFromAcT(AcTState) : 'Unknown',
        },
        OPERATOR: {
            value: operatorInfo ? operatorInfo.operator : 'Unknown',
        },
        MNC: {
            value: operatorInfo
                ? `${operatorInfo.brand} (${operatorInfo.mnc})`
                : 'Unknown',
        },
        MCC: {
            value: operatorInfo
                ? `${operatorInfo.countryName} (${operatorInfo.mcc})`
                : 'Unknown',
        },
        EARFCN: {
            value: earfcn == null || Number.isNaN(earfcn) ? 'Unknown' : earfcn,
        },
        RSRP: {
            value: signalQuality?.rsrp_decibel
                ? `${signalQuality?.rsrp_decibel} dB`
                : 'Unknown',
        },
        RSRQ: {
            value: signalQuality?.rsrq_decibel
                ? `${signalQuality?.rsrq_decibel} dB`
                : 'Unknown',
        },
        SNR: {
            value: signalQuality?.snr_decibel
                ? `${signalQuality?.snr_decibel} dB`
                : 'Unknown',
        },
        'EPS NETWORK REGISTRATION STATUS': {
            value: networkStatus ?? 'Unknown',
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
            value: parseCellId(cellID),
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

const parseCellId = (id?: string) => {
    if (id != null) {
        const hexValue = `0x${id}`;
        const decimalValue = parseInt(hexValue, 16);
        return `${decimalValue} (${hexValue})`;
    }

    return 'Unknown';
};
