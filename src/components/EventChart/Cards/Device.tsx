/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getAT } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard from './DashboardCard';

const formatAvailableBands = (bandsArray: number[]) =>
    `${bandsArray.join(',')}`;

export default () => {
    const { IMEI, currentBand, availableBands, manufacturer } =
        useSelector(getAT);

    const fields = {
        IMEI: IMEI ?? 'Unknown',
        'REVISION ID': 'Not Implemented',
        'HARDWARE VERSION': 'Not Implemented',
        'MODEM UUID': 'Not Implemented',
        'CURRENT BAND': currentBand ?? 'Unknown',
        'AVAILABLE BANDS': availableBands
            ? formatAvailableBands(availableBands)
            : 'Unknown',
        'DATA PROFILE': 'Not Implemented',
        MANUFACTURER: manufacturer ?? 'Unknown',
    };
    return (
        <DashboardCard
            title="Device"
            iconName="mdi-integrated-circuit-chip"
            fields={fields}
        />
    );
};
