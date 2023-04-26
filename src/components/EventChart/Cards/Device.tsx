/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { documentation } from '../../../../resources/docs/dashboard_fields';
import { FunctionalMode } from '../../../features/tracingEvents/at/commandProcessors/functionMode';
import { Mode } from '../../../features/tracingEvents/at/commandProcessors/TXPowerReduction';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

const { Device: docs } = documentation;

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
            ...docs.IMEI,
        },
        'MODEM FIRMWARE': {
            value: revisionID ?? 'Unknown',
            ...docs['MODEM FIRMWARE'],
        },
        'HARDWARE VERSION': {
            value: hardwareVersion ?? 'Unknown',
            ...docs['HARDWARE VERSION'],
        },
        'MODEM UUID': {
            value: modemUUID ?? 'Unknown',
            ...docs['MODEM UUID'],
        },
        'CURRENT BAND': {
            value: currentBand ?? 'Unknown',
            ...docs['CURRENT BAND'],
        },
        'SUPPORTED BANDS': {
            value: availableBands
                ? formatAvailableBands(availableBands)
                : 'Unknown',
            ...docs['SUPPORTED BANDS'],
        },
        'DATA PROFILE': {
            value: dataProfile ?? 'Unknown',
            ...docs['DATA PROFILE'],
        },
        MANUFACTURER: {
            value: manufacturer ?? 'Unknown',
            ...docs.MANUFACTURER,
        },
        'PREFERRED BEARER': {
            value: parsePreferredBearer(modemSystemPreference),
            ...docs['PREFERRED BEARER'],
        },
        'SUPPORTED BEARERS': {
            value: haveRecievedModemSupport
                ? parseSupportedValue([
                      modemSupportLTEM ?? false,
                      modemSupportNBIoT ?? false,
                      modemSupportGNSS ?? false,
                  ])
                : 'Unknown',
            ...docs['SUPPORTED BEARERS'],
        },
        'FUNCTIONAL MODE': {
            value: parseFunctionalMode(functionalMode),
            ...docs['FUNCTIONAL MODE'],
        },
        'TRACE STATE OPERATION': {
            value: xModemTraceOperation ?? 'Unknown',
            ...docs['TRACE STATE OPERATION'],
        },
        'TRACE STATE SET ID': {
            value: xModemTraceSetID ?? 'Unknown',
            ...docs['TRACE STATE SET ID'],
        },
        // Should be removed:
        'LTE-M TX REDUCTION': {
            value: formatMode(ltemTXReduction) ?? 'Unknown',
            ...docs['LTE-M TX REDUCTION'],
        },
        'NB-IOT TX REDUCTION': {
            value: formatMode(nbiotTXReduction) ?? 'Unknown',
            ...docs['NB-IOT TX REDUCTION'],
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
        return `Maximum power reduced ${txPowerReductionToDecibel(
            mode
        )} on all bands`;
    }
    return mode
        .map(
            band => `${band.band}: ${txPowerReductionToDecibel(band.reduction)}`
        )
        .join(', ');
};

const txPowerReductionToDecibel = (reduction: number) => {
    switch (reduction) {
        case 0:
            return '0 dB';
        case 1:
            return '0.5 dB';
        case 2:
            return '1 dB';
        default:
            return 'Unknown' as never;
    }
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
