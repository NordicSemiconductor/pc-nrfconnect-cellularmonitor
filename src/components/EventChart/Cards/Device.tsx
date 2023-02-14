/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { DocumentationKeys } from '../../../features/tracingEvents/at';
import { FunctionalMode } from '../../../features/tracingEvents/at/commandProcessors/functionMode';
import { Mode } from '../../../features/tracingEvents/at/commandProcessors/TXPowerReduction';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard from './DashboardCard';

const formatAvailableBands = (bandsArray: number[]) =>
    `${bandsArray.join(',')}`;

export default () => {
    const {
        IMEI,
        revisionID,
        hardwareVersion,
        modemUUID,
        functionalMode,
        currentBand,
        availableBands,
        manufacturer,
        dataProfile,
        ltemTXReduction,
        nbiotTXReduction,
    } = useSelector(getDashboardState);

    const fields = {
        'Funcational Mode': {
            value: parseFunctionalMode(functionalMode),
            commands: ['AT+CFUN'] as DocumentationKeys[] as DocumentationKeys[],
        },
        IMEI: {
            value: IMEI ?? 'Unknown',
            commands: ['AT+CGSN'] as DocumentationKeys[],
        },
        'MODEM FIRMWARE': {
            value: revisionID ?? 'Unknown',
            commands: ['AT+CGMR'] as DocumentationKeys[],
        },
        'HARDWARE VERSION': {
            value: hardwareVersion ?? 'Unknown',
            commands: ['AT%HWVERSION'] as DocumentationKeys[],
        },
        'MODEM UUID': {
            value: modemUUID ?? 'Unknown',
            commands: ['AT%XMODEMUUID'] as DocumentationKeys[],
        },
        'CURRENT BAND': {
            value: currentBand ?? 'Unknown',
            commands: ['AT%XCBAND'] as DocumentationKeys[],
        },
        'AVAILABLE BANDS': {
            value: availableBands
                ? formatAvailableBands(availableBands)
                : 'Unknown',
            commands: ['AT%XCBAND'] as DocumentationKeys[],
        },
        'DATA PROFILE': {
            value: dataProfile ?? 'Unknown',
            commands: ['AT%XDATAPRFL'] as DocumentationKeys[],
        },
        MANUFACTURER: {
            value: manufacturer ?? 'Unknown',
            commands: ['AT+CGMI'] as DocumentationKeys[],
        },
        'LTE-M TX Reduction': {
            value: formatMode(ltemTXReduction) ?? 'Unknown',
            commands: [] as DocumentationKeys[],
        },
        'NB-IoT TX Reduction': {
            value: formatMode(nbiotTXReduction) ?? 'Unknown',
            commands: [] as DocumentationKeys[],
        },
    };
    return (
        <DashboardCard
            title="Device"
            iconName="mdi-integrated-circuit-chip"
            fields={fields}
        />
    );
};

const functionalModeStrings = {
    0: 'Power off',
    1: 'Normal',
    4: 'Offline/Flight mode',
    44: 'Offline/Flight mode without shutting down UICC',
};

const functionalModeHasStringValue = (
    mode: FunctionalMode
): mode is keyof typeof functionalModeStrings => {
    if (Object.keys(functionalModeStrings).includes(`${mode}`)) {
        return true;
    }
    return false;
};

const parseFunctionalMode = (mode: FunctionalMode): string => {
    if (mode === undefined) return 'Unknown';
    if (functionalModeHasStringValue(mode)) {
        return `${mode}: ${functionalModeStrings[mode]}`;
    }
    return `${mode}`;
};

const formatMode = (mode?: Mode) => {
    if (mode === undefined) {
        return 'Unknown';
    }
    if (typeof mode === 'number') {
        return mode;
    }
    return mode.map(band => `${band.band}: ${band.reduction}`).join(', ');
};
