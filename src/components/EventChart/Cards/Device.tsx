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
        // xModemTrace
        xModemTraceOperation,
        xModemTraceSetID,
    } = useSelector(getDashboardState);

    const haveRecievedModemSupport = !(
        modemSupportLTEM === undefined ||
        modemSupportNBIoT === undefined ||
        modemSupportGNSS === undefined
    );

    const fields: DashboardCardFields = {
        IMEI: {
            value: IMEI ?? 'Unknown',
            description: `The International Mobile Equipment Identity (IMEI) is a unique 15-digit code that identifies a mobile device. Every device has a unique IMEI, which can be used to track the device, block it from being used on a cellular network if it's been reported as lost or stolen, and for other purposes such as device authentication.`,
            commands: ['AT+CGSN'] as const,
        },
        'MODEM FIRMWARE': {
            value: revisionID ?? 'Unknown',
            description: `The modem firmware version is the version of the firmware that is currently running on the modem. This version can be used in order to select the correct trace database, and you do not get any AT activity in a trace, try going to the Serial Terminal and run the command "AT+CGMR".`,
            commands: ['AT+CGMR'] as const,
        },
        'HARDWARE VERSION': {
            value: hardwareVersion ?? 'Unknown',
            description: 'The hardware revision of the User Equipment (UE).',
            commands: ['AT%HWVERSION'] as const,
        },
        'MODEM UUID': {
            value: modemUUID ?? 'Unknown',
            description:
                'The Modem UUID is a unique identifier that is generated during the manufacturing of the modem firmware, and can be used to track the specific version of the firmware that is running on a device.',
            commands: ['AT%XMODEMUUID'] as const,
        },
        'CURRENT BAND': {
            value: currentBand ?? 'Unknown',
            description:
                'The band, or current band, refers to the specific frequency range within the electromagnetic spectrum that a mobile device is using to communicate with the cellular network. Knowing the current band can help a user ensure that their device is operating on the appropriate network for their location and service provider.',
            commands: ['AT%XCBAND', 'AT%CONEVAL'] as const,
        },
        'SUPPORTED BANDS': {
            value: availableBands
                ? formatAvailableBands(availableBands)
                : 'Unknown',
            description:
                'The Supported Bands returned by the AT command %XCBAND=? represents a list of the different frequency bands that the mobile device is capable of using for its cellular communication. This information can be useful for determining which networks and service providers are compatible with the device, as well as for troubleshooting connection issues related to network compatibility.',
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
        'PREFERRED BEARER': {
            value: parsePreferredBearer(modemSystemPreference),
            commands: ['AT%XSYSTEMMODE'] as const,
        },
        'ENABLED BEARER': {
            value: haveRecievedModemSupport
                ? parseSupportedValue([
                      modemSupportLTEM ?? false,
                      modemSupportNBIoT ?? false,
                      modemSupportGNSS ?? false,
                  ])
                : 'Unknown',
            commands: ['AT%XSYSTEMMODE'] as const,
        },
        'FUNCTIONAL MODE': {
            value: parseFunctionalMode(functionalMode),
            commands: ['AT+CFUN'] as const,
        },
        // Should be removed:
        'LTE-M TX REDUCTION': {
            value: formatMode(ltemTXReduction) ?? 'Unknown',
            commands: [] as const,
        },
        'NB-IOT TX REDUCTION': {
            value: formatMode(nbiotTXReduction) ?? 'Unknown',
            commands: [] as const,
        },
        'TRACE STATE OPERATION': {
            value: xModemTraceOperation ?? 'Unknown',
            commands: ['AT%XMODEMTRACE'],
        },
        'TRACE STATE SET ID': {
            value: xModemTraceSetID ?? 'Unknown',
            commands: ['AT%XMODEMTRACE'],
        },
    };
    return (
        <DashboardCard
            key="dashboard-device-card"
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
