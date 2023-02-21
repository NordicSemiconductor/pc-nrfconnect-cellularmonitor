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
        'Collecting data': {
            value: parseCollecting(connStat?.collecting),
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'Successfull SMS Tx': {
            value: connStat?.smsTX ?? 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'Successfull SMS Rx': {
            value: connStat?.smsRX ?? 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'Data Transmitted': {
            value: connStat?.dataTX ? `${connStat?.dataTX} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'Data Recieved': {
            value: connStat?.dataRX ? `${connStat?.dataRX} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'Max Packet Size Tx or Rx': {
            value: connStat?.packetMax ? `${connStat.packetMax} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
        'Average Packet Size': {
            value: connStat?.packetAverage
                ? `${connStat.packetAverage} kB`
                : 'Unknown',
            commands: ['AT%XCONNSTAT'] as ATCommands[],
        },
    };

    return (
        <DashboardCard
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
