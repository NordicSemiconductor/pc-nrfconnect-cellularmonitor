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
        'Collecting data': parseCollecting(connStat?.collecting),
        'Successfull SMS Tx': connStat?.smsTX ?? 'Unknown',
        'Successfull SMS Rx': connStat?.smsRX ?? 'Unknown',
        'Data Transmitted': connStat?.dataTX
            ? `${connStat?.dataTX} kB`
            : 'Unknown',
        'Data Recieved': connStat?.dataRX
            ? `${connStat?.dataRX} kB`
            : 'Unknown',
        'Max Packet Size Tx or Rx': connStat?.packetMax
            ? `${connStat.packetMax} kB`
            : 'Unknown',
        'Average Packet Size': connStat?.packetAverage
            ? `${connStat.packetAverage} kB`
            : 'Unknown',
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
