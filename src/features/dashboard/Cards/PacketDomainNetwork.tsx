/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { AccessPointName } from '../../tracingEvents/types';
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
    cid,
}: AccessPointName) => {
    const fields: DashboardCardFields = {
        'ACCESS POINT NAME': {
            value: apn ?? 'Unknown',
        },
        'PDN TYPE': { value: pdnType ?? 'Unknown' },
        'PDN TYPE RAW': { value: rawPDNType ?? 'Unknown' },
        'IPV4 ADDRESS': { value: ipv4 ?? 'Unknown' },
        'IPV6 ADDRESS': { value: `${ipv6}` ?? 'Unknown' },
        INFO: { value: info ?? 'Unknown' },
        CONNECTION: { value: connection ?? 'Unknown' },
        'CONTEXT ID': { value: cid ?? 'Unknown' },
    };
    const fieldsToDisplay = Object.keys(fields)
        .filter(field => {
            const value = fields[field].value;
            return (
                value !== 'Unknown' && value !== 'undefined' && value != null
            );
        })
        .reduce((acc, field) => {
            acc[field] = fields[field];
            return acc;
        }, {} as DashboardCardFields);

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
            fields={fieldsToDisplay}
        />
    );
};
