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
            commands: ['AT+CGSN'],
        },
        'MODEM FIRMWARE': {
            value: revisionID ?? 'Unknown',
            description: `The modem firmware version is the version of the firmware that is currently running on the modem. This version can be used in order to select the correct trace database, and you do not get any AT activity in a trace, try going to the Serial Terminal and run the command "AT+CGMR".`,
            commands: ['AT+CGMR'],
        },
        'HARDWARE VERSION': {
            value: hardwareVersion ?? 'Unknown',
            description: 'The hardware revision of the User Equipment (UE).',
            commands: ['AT%HWVERSION'],
        },
        'MODEM UUID': {
            value: modemUUID ?? 'Unknown',
            description:
                'The Modem UUID is a unique identifier that is generated during the manufacturing of the modem firmware, and can be used to track the specific version of the firmware that is running on a device.',
            commands: ['AT%XMODEMUUID'],
        },
        'CURRENT BAND': {
            value: currentBand ?? 'Unknown',
            description:
                'The band, or current band, refers to the specific frequency range within the electromagnetic spectrum that a mobile device is using to communicate with the cellular network. Knowing the current band can help a user ensure that their device is operating on the appropriate network for their location and service provider.',
            commands: ['AT%XCBAND', 'AT%CONEVAL'],
        },
        'SUPPORTED BANDS': {
            value: availableBands
                ? formatAvailableBands(availableBands)
                : 'Unknown',
            description:
                'The Supported Bands returned by the AT command %XCBAND=? represents a list of the different frequency bands that the mobile device is capable of using for its cellular communication. This information can be useful for determining which networks and service providers are compatible with the device, as well as for troubleshooting connection issues related to network compatibility.',
            commands: ['AT%XCBAND'],
        },
        'DATA PROFILE': {
            value: dataProfile ?? 'Unknown',
            description: 'A data profile specifies the settings for a cellular data connection, such as the APN (Access Point Name), authentication settings, and other parameters',
            commands: ['AT%XDATAPRFL'],
        },
        MANUFACTURER: {
            value: manufacturer ?? 'Unknown',
            description: 'Identification of the manufacturer of the modem.',
            commands: ['AT+CGMI'],
        },
        'PREFERRED BEARER': {
            value: parsePreferredBearer(modemSystemPreference),
            description: 'The preferred bearer is the preferred network type for the modem. The preferred bearer can be set to LTE-M or NB-IoT, please read the documentation for more information.',
            commands: ['AT%XSYSTEMMODE'],
        },
        'SUPPORTED BEARERS': {
            value: haveRecievedModemSupport
                ? parseSupportedValue([
                      modemSupportLTEM ?? false,
                      modemSupportNBIoT ?? false,
                      modemSupportGNSS ?? false,
                  ])
                : 'Unknown',
            description: 'List of supported bearers. Possible bearers are LTE-M, NB-IoT and GNSS.',
            commands: ['AT%XSYSTEMMODE'],
        },
        'FUNCTIONAL MODE': {
            value: parseFunctionalMode(functionalMode),
            description: 'The functional mode of the modem. E.g. Power off, Normal, Offline/Flight mode, etc.',
            commands: ['AT+CFUN'],
        },
        'TRACE STATE OPERATION': {
            value: xModemTraceOperation ?? 'Unknown',
            description: 'The Trace State Operation of the modem. Recommended value when using the app is (1,2): AT%XMODEMTRACE=1,2',
            commands: ['AT%XMODEMTRACE'],
        },
        'TRACE STATE SET ID': {
            value: xModemTraceSetID ?? 'Unknown',
            description: 'The Trace State Operation of the modem. Recommended value when using the app is (1,2): AT%XMODEMTRACE=1,2',
            commands: ['AT%XMODEMTRACE'],
        },
        // Should be removed:
        'LTE-M TX REDUCTION': {
            value: formatMode(ltemTXReduction) ?? 'Unknown',
            description: 'The Nordic-proprietary %XEMPR command allows to configure an extra reduction of 0.5 or 1 dB to the maximum transmission power on all or selected supported 3GPP bands separately in the NB-IoT and LTEM modes. %XEMPR should be given before the activation of the modem to be effective',
            commands: ['AT%XEMPR'],
        },
        'NB-IOT TX REDUCTION': {
            value: formatMode(nbiotTXReduction) ?? 'Unknown',
            description: 'The Nordic-proprietary %XEMPR command allows to configure an extra reduction of 0.5 or 1 dB to the maximum transmission power on all or selected supported 3GPP bands separately in the NB-IoT and LTEM modes. %XEMPR should be given before the activation of the modem to be effective',
            commands: ['AT%XEMPR'],
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
