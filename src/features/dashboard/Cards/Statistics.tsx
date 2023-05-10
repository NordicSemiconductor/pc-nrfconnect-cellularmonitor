/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../tracingEvents/dashboardSlice';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

export default () => {
    const { connStat } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        'COLLECTING DATA': {
            value: parseCollecting(connStat?.collecting),
        },
        'SUCCESSFUL SMS TX': {
            value: connStat?.smsTX ?? 'Unknown',
        },
        'SUCCESSFUL SMS RX': {
            value: connStat?.smsRX ?? 'Unknown',
        },
        'DATA TRANSMITTED': {
            value:
                connStat?.dataTX != null ? `${connStat?.dataTX} kB` : 'Unknown',
        },
        'DATA RECIEVED': {
            value:
                connStat?.dataRX != null ? `${connStat?.dataRX} kB` : 'Unknown',
        },
        'MAX PACKET SIZE TX OR RX': {
            value:
                connStat?.packetMax != null
                    ? `${connStat.packetMax} B`
                    : 'Unknown',
        },
        'AVERAGE PACKET SIZE': {
            value:
                connStat?.packetAverage != null
                    ? `${connStat.packetAverage} B`
                    : 'Unknown',
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
