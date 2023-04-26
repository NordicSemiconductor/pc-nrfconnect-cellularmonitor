/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { documentation } from '../../../../resources/docs/dashboard_fields';
import { AccessPointName } from '../../../features/tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

const { 'Packet Domain Network': docs } = documentation;

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
            ...docs['Access Point Name'],
        },
        'PDN Type': { value: pdnType ?? 'Unknown', ...docs['PDN Type'] },
        'PDN Type Raw': {
            value: rawPDNType ?? 'Unknown',
            ...docs['PDN Type Raw'],
        },
        'IPv4 Address': { value: ipv4 ?? 'Unknown', ...docs['IPv4 Address'] },
        'IPv6 Address': {
            value: `${ipv6}` ?? 'Unknown',
            ...docs['IPv6 Address'],
        },
        info: { value: info ?? 'Unknown', ...docs.info },
        Connection: { value: connection ?? 'Unknown', ...docs.Connection },
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
