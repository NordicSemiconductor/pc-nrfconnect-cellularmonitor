/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getModem } from '../../../features/at/atSlice';
import { Mode } from '../../../features/at/commandProcessors/TXPowerReduction';
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
    } = useSelector(getModem);

    const fields = {
        IMEI: IMEI ?? 'Unknown',
        'Revision ID': revisionID ?? 'Unknown',
        'Hardware Version': hardwareVersion ?? 'Unknown',
        'Modem UUID': modemUUID ?? 'Unknown',
        'Current Band': currentBand ?? 'Unknown',
        'Available Bands': availableBands?.length
            ? formatAvailableBands(availableBands)
            : 'Unknown',
        'Data Profile': dataProfile ?? 'Unknown',
        'TX Power Reduction (LTE-M)': formatMode(ltemTXReduction),
        'TX Power Reduction (NB-IoT)': formatMode(nbiotTXReduction),
    };

    return (
        <DashboardCard
            title="Modem"
            iconName="mdi-cellphone-wireless"
            information="Some information"
            onclick={null}
            fields={fields}
        >
            {/* <ul>
                {Object.entries(fields).map(([key, value]) => (
                    <li key={key}>
                        <p className="card-key">{key.toUpperCase()}</p>
                        <p className="card-value">{value}</p>
                    </li>
                ))}
            </ul> */}
        </DashboardCard>
    );
};
