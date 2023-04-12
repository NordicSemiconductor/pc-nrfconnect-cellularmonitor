/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { ATCommands } from '../../../features/tracingEvents/at';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

export default () => {
    const { connStat } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        'COLLECTING DATA': {
            value: parseCollecting(connStat?.collecting),
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'SUCCESSFULL SMS TX': {
            value: connStat?.smsTX ?? 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'SUCCESSFULL SMS RX': {
            value: connStat?.smsRX ?? 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'DATA TRANSMITTED': {
            value: connStat?.dataTX ? `${connStat?.dataTX} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'DATA RECIEVED': {
            value: connStat?.dataRX ? `${connStat?.dataRX} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'MAX PACKET SIZE TX OR RX': {
            value: connStat?.packetMax ? `${connStat.packetMax} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'AVERAGE PACKET SIZE': {
            value: connStat?.packetAverage
                ? `${connStat.packetAverage} kB`
                : 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
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
