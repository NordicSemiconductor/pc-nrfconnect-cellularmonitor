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
    const fields = {
        'Access Point Name': { value: apn ?? 'Unknown', commands: [] },
        'PDN Type': { value: pdnType ?? 'Unknown', commands: [] },
        'PDN Type Raw': { value: rawPDNType ?? 'Unknown', commands: [] },
        'IPv4 Address': { value: ipv4 ?? 'Unknown', commands: [] },
        'IPv6 Address': { value: `${ipv6}` ?? 'Unknown', commands: [] },
        info: { value: info ?? 'Unknown', commands: [] },
    };
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
            fields={fields}
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
