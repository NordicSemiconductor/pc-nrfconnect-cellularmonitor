/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { colors } from 'pc-nrfconnect-shared';

import { FunctionalMode } from '../../tracingEvents/at/commandProcessors/functionMode';
import { Mode } from '../../tracingEvents/at/commandProcessors/TXPowerReduction';
import { getDashboardState } from '../../tracingEvents/dashboardSlice';
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
        meOverheated,
        meBatteryLow,
        searchStatus1,
        searchStatus2,
        resetLoop,
    } = useSelector(getDashboardState);

    const haveRecievedModemSupport = !(
        modemSupportLTEM === undefined ||
        modemSupportNBIoT === undefined ||
        modemSupportGNSS === undefined
    );

    const fields: DashboardCardFields = {
        IMEI: {
            value: IMEI ?? 'Unknown',
        },
        'MODEM FIRMWARE': {
            value: revisionID ?? 'Unknown',
        },
        'HARDWARE VERSION': {
            value: hardwareVersion ?? 'Unknown',
        },
        'MODEM UUID': {
            value: modemUUID ?? 'Unknown',
        },
        'CURRENT BAND': {
            value: currentBand ?? 'Unknown',
        },
        'SUPPORTED BANDS': {
            value: availableBands
                ? formatAvailableBands(availableBands)
                : 'Unknown',
        },
        'DATA PROFILE': {
            value: dataProfile ?? 'Unknown',
        },
        MANUFACTURER: {
            value: manufacturer ?? 'Unknown',
        },
        'PREFERRED BEARER': {
            value: parsePreferredBearer(modemSystemPreference),
        },
        'SUPPORTED BEARERS': {
            value: haveRecievedModemSupport
                ? parseSupportedValue([
                      modemSupportLTEM ?? false,
                      modemSupportNBIoT ?? false,
                      modemSupportGNSS ?? false,
                  ])
                : 'Unknown',
        },
        'FUNCTIONAL MODE': {
            value: parseFunctionalMode(functionalMode),
        },
        'TRACE STATE OPERATION': {
            value: xModemTraceOperation ?? 'Unknown',
        },
        'TRACE STATE SET ID': {
            value: xModemTraceSetID ?? 'Unknown',
        },
        // Should be removed:
        'LTE-M TX REDUCTION': {
            value: formatMode(ltemTXReduction) ?? 'Unknown',
        },
        'NB-IOT TX REDUCTION': {
            value: formatMode(nbiotTXReduction) ?? 'Unknown',
        },
        'ME OVERHEATED': {
            value: meOverheated ? 'Yes' : 'No',
            conditionalStyle: addWarningStyle(meOverheated),
        },
        'ME BATTERY LOW': {
            value: meBatteryLow ? 'Yes' : 'No',
            conditionalStyle: addWarningStyle(meBatteryLow),
        },
        'SEARCH STATUS 1': {
            value: searchStatus1 ? 'Yes' : 'No',
        },
        'SEARCH STATUS 2': {
            value: searchStatus2 ? 'Yes' : 'No',
        },
        'RESET LOOP': {
            value: resetLoop ? 'Yes' : 'No',
            conditionalStyle: addWarningStyle(resetLoop),
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

    if (mode === 'Not set') {
        return mode;
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

const addWarningStyle = (active?: boolean): React.CSSProperties =>
    active
        ? {
              // orange200
              backgroundColor: '#FFCC80',
              animation: 'unset',
          }
        : {};
