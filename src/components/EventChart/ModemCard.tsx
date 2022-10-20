/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getModem } from '../../at/atSlice';
import DashboardCard from '../Dashboard/DashboardCard';

const formatAvailableBands = (bandsArray: number[]) =>
    `[ ${bandsArray.join(' , ')} ]`;

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
        'TX Power Reduction (LTE-M)': ltemTXReduction ?? 'Unknown',
        'TX Power Reduction (NB-IoT)': nbiotTXReduction ?? 'Unknown',
    };

    return (
        <DashboardCard
            title="Modem"
            iconName="mdi-cellphone-wireless"
            onclick={() => {}}
        >
            <ul>
                {Object.entries(fields).map(([key, value]) => (
                    <li key={key}>
                        <p>{key}:</p>
                        <p>{value}</p>
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
};
