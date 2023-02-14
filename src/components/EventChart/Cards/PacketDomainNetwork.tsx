/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import { AccessPointName } from '../../../features/tracingEvents/types';
import DashboardCard from './DashboardCard';

const PacketDomainNetwork = ({
    apn,
    pdnType,
    rawPDNType,
    ipv4,
    ipv6,
    info,
}: AccessPointName) => {
    const fields = Object.fromEntries(
        Object.entries({
            'Access Point Name': apn ?? undefined,
            'PDN Type': pdnType ?? undefined,
            'PDN Type Raw': rawPDNType ?? undefined,
            'IPv4 Address': ipv4 ?? undefined,
            'IPv6 Address': `${ipv6}` ?? undefined,
            info: info ?? undefined,
        }).filter(([, value]) => value != null)
    ) as unknown as Record<string, string>;
    return (
        <DashboardCard
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
            fields={fields as unknown as Record<string, string | number>}
        />
    );
};

export default () => {
    // Each instance in the list of accessPointNames is a "Packet Domain Network".
    const { accessPointNames } = useSelector(getDashboardState);

    if (accessPointNames == null) {
        return null;
    }

    return <>{accessPointNames.map(apn => PacketDomainNetwork(apn))}</>;
};
