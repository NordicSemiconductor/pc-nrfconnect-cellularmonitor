/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getModem } from '../../at/atSlice';
import DashboardCard from '../Dashboard/DashboardCard';

const formatAvailableBands = (bandsArray: number[]) =>  `[ ${bandsArray.join(' , ')} ]`

export default () => {
    const {
        IMEI,
        revisionID,
        hardwareVersion,
        modemUUID,
        currentBand,
        availableBands,
        dataProfile,
    } = useSelector(getModem);

    const fields = {
        IMEI: IMEI ?? 'Unknown',
        revisionID: revisionID ?? 'Unknown',
        hardwareVersion: hardwareVersion ?? 'Unknown',
        modemUUID: modemUUID ?? 'Unknown',
        currentBand: currentBand ?? 'Unknown',
        availableBands: availableBands?.length ? formatAvailableBands(availableBands) : 'Unknown',
        dataProfile: dataProfile ?? 'Unknown',
    };

    return (
        <DashboardCard title="Modem" iconName="mdi-cellphone-wireless" onclick={() => {}}>
            <ul>
                {Object.entries(fields).map(([key, value]) => (
                    <li key={key}>
                        {key}: {value}
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
};
