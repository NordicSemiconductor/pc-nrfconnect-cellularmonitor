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
        'Access Point Name': { value: apn ?? 'Unknown', commands: [] },
        'PDN Type': { value: pdnType ?? 'Unknown', commands: [] },
        'PDN Type Raw': { value: rawPDNType ?? 'Unknown', commands: [] },
        'IPv4 Address': { value: ipv4 ?? 'Unknown', commands: [] },
        'IPv6 Address': { value: `${ipv6}` ?? 'Unknown', commands: [] },
        info: { value: info ?? 'Unknown', commands: [] },
        Connection: { value: connection ?? 'Unknown', commands: [] },
    };

    if (cause) {
        fields['Cause Code'] = {
            value: cause.code,
            commands: [],
            description: cause.reason,
        };
    }
    return (
        <DashboardCard
            key={`dashboard-apn-${apn}-card`}
            title={
                apn
                    ? apn
                          ?.split('.')
                          .slice(0, 2)
                          .map(word => word.toUpperCase())
                          .join(' ')
                    : 'Unknown APN'
            }
            iconName="mdi-web"
            fields={fields}
        />
    );
};
