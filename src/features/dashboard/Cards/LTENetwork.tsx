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
            value: parseActivityStatus(networkStatus),
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
            value: parseRsrp(signalQuality?.rsrp, signalQuality?.rsrp_decibel),
        },
        RSRQ: {
            value: parseRsrq(signalQuality?.rsrq, signalQuality?.rsrq_decibel),
        },
        SNR: {
            value: parseSnr(signalQuality?.snr, signalQuality?.snr_decibel),
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

const parseActivityStatus = (networkStatus?: number) => {
    if (networkStatus === undefined) return 'Unknown';
    switch (networkStatus) {
        case 0:
            return 'Not registered';
        case 1:
            return 'Registered, home network';
        case 2:
            return 'Not registered, attaching or searching';
        case 3:
            return 'Registration denied';
        case 4:
            return 'Unknown';
        case 5:
            return 'Registered, roaming';
        case 90:
            return 'Not registered due to UICC failure';
        default:
            return 'Unknown';
    }
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

const parseRsrp = (rsrp?: number, rsrpDecibel?: number) => {
    if (rsrp == null) return 'Unknown';

    if (rsrp === 255) {
        return 'Not known or not detectable (255)';
    }

    if (rsrpDecibel != null) {
        let quality = '';
        if (rsrpDecibel >= -84) {
            quality = 'Excellent';
        } else if (rsrpDecibel <= -85 && rsrpDecibel >= -102) {
            quality = 'Good';
        } else if (rsrpDecibel <= -103 && rsrpDecibel >= -111) {
            quality = 'Fair';
        } else if (rsrpDecibel < -111) {
            quality = 'Poor';
        }
        return `${quality} (${rsrpDecibel} dBm)`;
    }

    return 'Unknown' as never;
};

const parseRsrq = (rsrq?: number, rsrqDecibel?: number) => {
    if (rsrq == null) return 'Unknown';

    if (rsrq === 255) {
        return 'Not known or not detectable (255)';
    }

    if (rsrqDecibel != null) {
        let quality = '';
        if (rsrqDecibel >= -4) {
            quality = 'Excellent';
        } else if (rsrqDecibel <= -5 && rsrqDecibel >= -9) {
            quality = 'Good';
        } else if (rsrqDecibel <= -9 && rsrqDecibel >= -12) {
            quality = 'Fair';
        } else if (rsrqDecibel < -12) {
            quality = 'Poor';
        }
        return `${quality} (${rsrqDecibel} dB)`;
    }

    return 'Unknown' as never;
};

const parseSnr = (snr?: number, snrDecibel?: number) => {
    if (snr == null) return 'Unknown';

    if (snr === 255) {
        return 'Not known or not detectable (255)';
    }

    if (snrDecibel != null) {
        let quality = '';
        if (snrDecibel >= 12.5) {
            quality = 'Excellent';
        } else if (snrDecibel >= 10 && snrDecibel <= 12.5) {
            quality = 'Good';
        } else if (snrDecibel >= 7 && snrDecibel <= 10) {
            quality = 'Fair';
        } else if (snrDecibel < 7) {
            quality = 'Poor';
        }
        return `${quality} (${snrDecibel} dB)`;
    }

    return 'Unknown' as never;
};
