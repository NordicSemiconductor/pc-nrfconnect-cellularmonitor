/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard from './DashboardCard';

export default () => {
    const { connStat } = useSelector(getDashboardState);

    const fields = {
        'Collecting data': {
            value: parseCollecting(connStat?.collecting),
            commands: [],
        },
        'Successfull SMS Tx': {
            value: connStat?.smsTX ?? 'Unknown',
            commands: [],
        },
        'Successfull SMS Rx': {
            value: connStat?.smsRX ?? 'Unknown',
            commands: [],
        },
        'Data Transmitted': {
            value: connStat?.dataTX ? `${connStat?.dataTX} kB` : 'Unknown',
            commands: [],
        },
        'Data Recieved': {
            value: connStat?.dataRX ? `${connStat?.dataRX} kB` : 'Unknown',
            commands: [],
        },
        'Max Packet Size Tx or Rx': {
            value: connStat?.packetMax ? `${connStat.packetMax} kB` : 'Unknown',
            commands: [],
        },
        'Average Packet Size': {
            value: connStat?.packetAverage
                ? `${connStat.packetAverage} kB`
                : 'Unknown',
            commands: [],
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
