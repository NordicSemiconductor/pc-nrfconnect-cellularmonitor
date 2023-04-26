/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { documentation } from '../../../../resources/docs/dashboard_fields';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

const { ConnectivityStatistics: docs } = documentation;

export default () => {
    const { connStat } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        'COLLECTING DATA': {
            value: parseCollecting(connStat?.collecting),
            ...docs['COLLECTING DATA'],
        },
        'SUCCESSFULL SMS TX': {
            value: connStat?.smsTX ?? 'Unknown',
            ...docs['SUCCESSFUL SMS TX'],
        },
        'SUCCESSFULL SMS RX': {
            value: connStat?.smsRX ?? 'Unknown',
            ...docs['SUCCESSFUL SMS RX'],
        },
        'DATA TRANSMITTED': {
            value: connStat?.dataTX ? `${connStat?.dataTX} kB` : 'Unknown',
            ...docs['DATA TRANSMITTED'],
        },
        'DATA RECIEVED': {
            value: connStat?.dataRX ? `${connStat?.dataRX} kB` : 'Unknown',
            ...docs['DATA RECIEVED'],
        },
        'MAX PACKET SIZE TX OR RX': {
            value: connStat?.packetMax ? `${connStat.packetMax} kB` : 'Unknown',
            ...docs['MAX PACKET SIZE TX OR RX'],
        },
        'AVERAGE PACKET SIZE': {
            value: connStat?.packetAverage
                ? `${connStat.packetAverage} kB`
                : 'Unknown',
            ...docs['AVERAGE PACKET SIZE'],
        },
    };

    return (
        <DashboardCard
            key="dashboard-statistics-card"
            title="Connectivity Statistics"
            iconName="mdi-cellphone-wireless"
            information="Subject to change"
            fields={fields}
        />
    );
};

const parseCollecting = (collecting: boolean | undefined) => {
    if (collecting === undefined) {
        return 'Unknown';
    }

    return collecting === true ? 'Yes' : 'No';
};
