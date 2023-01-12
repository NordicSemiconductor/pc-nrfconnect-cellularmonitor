/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { Mode } from '../../../features/tracingEvents/at/commandProcessors/TXPowerReduction';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard from './DashboardCard';

const formatAvailableBands = (bandsArray: number[]) =>
    `${bandsArray.join(',')}`;

const formatMode = (mode?: Mode) => {
    if (mode === undefined) {
        return 'Unknown';
    }
    if (typeof mode === 'number') {
        return mode;
    }
    return mode.map(band => `${band.band}: ${band.reduction}`).join(', ');
};

export default () => {
    const {
        IMEI,
        revisionID,
        hardwareVersion,
        modemUUID,
        currentBand,
        availableBands,
        dataProfile,
        ltemTXReduction,
        nbiotTXReduction,
    } = useSelector(getDashboardState);

    const fields = {
        IMEI: IMEI ?? 'Unknown',
        'Revision ID': revisionID ?? 'Unknown',
        'Hardware Version': (hardwareVersion as string) ?? 'Unknown',
        'Modem UUID': (modemUUID as string) ?? 'Unknown',
        'Current Band': currentBand ?? 'Unknown',
        'Available Bands': availableBands?.length
            ? formatAvailableBands(availableBands)
            : 'Unknown',
        'Data Profile': dataProfile ?? 'Unknown',
        'TX Power Reduction (LTE-M)': formatMode(ltemTXReduction as Mode),
        'TX Power Reduction (NB-IoT)': formatMode(nbiotTXReduction as Mode),
    };

    return (
        <DashboardCard
            title="Modem"
            iconName="mdi-cellphone-wireless"
            information="Some information"
            fields={fields}
        />
    );
};
