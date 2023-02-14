/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { DocumentationKeys } from '../../../features/tracingEvents/at';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard from './DashboardCard';

export default () => {
    const { connStat } = useSelector(getDashboardState);

    const fields = {
        'Collecting data': {
            value: parseCollecting(connStat?.collecting),
            commands: ['AT%XCONNSTAT'] as DocumentationKeys[],
        },
        'Successfull SMS Tx': {
            value: connStat?.smsTX ?? 'Unknown',
            commands: ['AT%XCONNSTAT'] as DocumentationKeys[],
        },
        'Successfull SMS Rx': {
            value: connStat?.smsRX ?? 'Unknown',
            commands: ['AT%XCONNSTAT'] as DocumentationKeys[],
        },
        'Data Transmitted': {
            value: connStat?.dataTX ? `${connStat?.dataTX} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as DocumentationKeys[],
        },
        'Data Recieved': {
            value: connStat?.dataRX ? `${connStat?.dataRX} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as DocumentationKeys[],
        },
        'Max Packet Size Tx or Rx': {
            value: connStat?.packetMax ? `${connStat.packetMax} kB` : 'Unknown',
            commands: ['AT%XCONNSTAT'] as DocumentationKeys[],
        },
        'Average Packet Size': {
            value: connStat?.packetAverage
                ? `${connStat.packetAverage} kB`
                : 'Unknown',
            commands: ['AT%XCONNSTAT'] as DocumentationKeys[],
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