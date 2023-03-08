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
import DashboardCard, { DashboardCardFields } from './DashboardCard';

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
        modemSystemPreference,
        modemSupportLTEM,
        modemSupportNBIoT,
        modemSupportGNSS,
    } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        IMEI: {
            value: IMEI ?? 'Unknown',
            commands: ['AT+CGSN'] as const,
        },
        'MODEM FIRMWARE': {
            value: revisionID ?? 'Unknown',
            commands: ['AT+CGMR'] as const,
        },
        'HARDWARE VERSION': {
            value: hardwareVersion ?? 'Unknown',
            commands: ['AT%HWVERSION'] as const,
        },
        'MODEM UUID': {
            value: modemUUID ?? 'Unknown',
            commands: ['AT%XMODEMUUID'] as const,
        },
        'CURRENT BAND': {
            value: currentBand ?? 'Unknown',
            commands: ['AT%XCBAND'] as const,
        },
        'SUPPORTED BANDS': {
            value: availableBands
                ? formatAvailableBands(availableBands)
                : 'Unknown',
            commands: ['AT%XCBAND'] as const,
        },
        'DATA PROFILE': {
            value: dataProfile ?? 'Unknown',
            commands: ['AT%XDATAPRFL'] as const,
        },
        MANUFACTURER: {
            value: manufacturer ?? 'Unknown',
            commands: ['AT+CGMI'] as const,
        },
        VOLTAGE: {
            value: 'NOT IMPLEMENTED',
            commands: [],
        },
        'Preferred Bearer': {
            value: parsePreferredBearer(modemSystemPreference),
            commands: ['AT%XSYSTEMMODE'] as const,
        },
        'ENABLED BEARERS': {
            value: parseSupportedValue([
                modemSupportLTEM ?? false,
                modemSupportNBIoT ?? false,
                modemSupportGNSS ?? false,
            ]),
            commands: ['AT%XSYSTEMMODE'] as const,
        },
        'BATTERY WARNING': {
            value: 'NOT IMPLEMENTED',
            commands: [],
        },
        'FUNCTIONAL MODE': {
            value: parseFunctionalMode(functionalMode),
            commands: ['AT+CFUN'] as const,
        },
        GNSS: {
            value: 'NOT IMPLEMENTED',
            commands: [],
        },
        OVERHEATING: {
            value: 'NOT IMPLEMENTED',
            commands: [],
        },

        // Should be removed:
        'LTE-M TX Reduction': {
            value: formatMode(ltemTXReduction) ?? 'Unknown',
            commands: [] as const,
        },
        'NB-IoT TX Reduction': {
            value: formatMode(nbiotTXReduction) ?? 'Unknown',
            commands: [] as const,
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

const parseSupportedValue = (supported: [boolean, boolean, boolean]) => {
    if (!supported.some(value => value === true)) return 'Nothing supported';
    const [lteM, nbIot, gnss] = supported;
    return `${lteM === true ? 'LTE-M ' : ''}${nbIot === true ? 'NB-IoT' : ''}${
        gnss === true ? ' GNSS' : ''
    }`;
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
