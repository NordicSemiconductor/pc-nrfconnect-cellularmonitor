/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { AccessPointName } from '../../../features/tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

export default ({
    apn,
    pdnType,
    rawPDNType,
    ipv4,
    ipv6,
    info,
    state: connection,
    cause,
}: AccessPointName) => {
    const fields: DashboardCardFields = {
        'Access Point Name': {
            value: apn ?? 'Unknown',
        },
        'PDN Type': { value: pdnType ?? 'Unknown' },
        'PDN Type Raw': {
            value: rawPDNType ?? 'Unknown',
        },
        'IPv4 Address': { value: ipv4 ?? 'Unknown' },
        'IPv6 Address': {
            value: `${ipv6}` ?? 'Unknown',
        },
        info: { value: info ?? 'Unknown' },
        Connection: { value: connection ?? 'Unknown' },
    };

    if (cause) {
        fields['Cause Code'] = {
            value: cause.code,
        };
    }
    return (
        <DashboardCard
            key={`dashboard-apn-${apn}-card`}
            title="PDN"
            iconName="mdi-web"
            fields={fields}
        />
    );
};
