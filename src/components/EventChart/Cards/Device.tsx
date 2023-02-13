/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

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
        'Funcational Mode': { value: parseFunctionalMode(functionalMode), commands: ['AT+CFUN'] },
        IMEI: { value: IMEI ?? 'Unknown', commands: ['AT+CGSN'] },
        'MODEM FIRMWARE': { value: revisionID ?? 'Unknown', commands: ['AT+CGMR'] },
        'HARDWARE VERSION': { value: hardwareVersion ?? 'Unknown', commands: ['AT%HWVERSION'] },
        'MODEM UUID': { value: modemUUID ?? 'Unknown', commands: ['AT%XMODEMUUID'] },
        'CURRENT BAND': { value: currentBand ?? 'Unknown', commands: ['AT%XCBAND'] },
        'AVAILABLE BANDS': { value: availableBands
            ? formatAvailableBands(availableBands)
            : 'Unknown', commands: ['AT%XCBAND'] },
        'DATA PROFILE': { value: dataProfile ?? 'Unknown', commands: ['AT%XDATAPRFL'] },
        MANUFACTURER: { value: manufacturer ?? 'Unknown', commands: ['AT+CGMI'] },
        'LTE-M TX Reduction': { value: formatMode(ltemTXReduction) ?? 'Unknown', commands: [] },
        'NB-IoT TX Reduction': { value: formatMode(nbiotTXReduction) ?? 'Unknown', commands: [] },
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
