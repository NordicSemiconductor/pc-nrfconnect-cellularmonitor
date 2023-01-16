/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceEvent } from '../../tracing/tracePacketEvents';
import { AttachAcceptPacket, parseIPv6Postfix } from '../nas';
import { AccessPointName, IPv6Address, IPv6Partial, State } from '../types';

export const mergeIpv6Address = (
    prefix: IPv6Partial,
    postfix: IPv6Partial
): IPv6Address | undefined =>
    prefix !== undefined && postfix !== undefined
        ? (`${prefix}:${postfix}` as IPv6Address)
        : undefined;

export default (packet: TraceEvent, state: State): State => {
    if (packet.jsonData) {
        const incomingPDN = (packet.jsonData as AttachAcceptPacket).pdn;
        if (incomingPDN == null) return state;

        const { accessPointNames } = state;

        const predicate = (apnToTest: AccessPointName) =>
            apnToTest.ipv6Postfix ===
            parseIPv6Postfix(incomingPDN['nas_eps.esm.pdn_ipv6_if_id']);

        const apn = accessPointNames.find(predicate);

        // Don't do anything if the APN isn't already in state.
        if (apn == null) return state;

        const ipv6Prefix =
            incomingPDN.ICMPv6_prefix != null
                ? (incomingPDN.ICMPv6_prefix.split(':')
                      .slice(0, 4)
                      .join(':') as IPv6Partial)
                : undefined;

        const newAPN: AccessPointName = {
            ...apn,
            ipv6Prefix: (ipv6Prefix as IPv6Partial) ?? undefined,
            ipv6:
                ipv6Prefix !== undefined && apn.ipv6Postfix !== undefined
                    ? mergeIpv6Address(ipv6Prefix, apn.ipv6Postfix)
                    : undefined,
        };

        const indexOfAPN = accessPointNames.indexOf(apn);

        const newAccessPointNames = [
            ...accessPointNames.slice(0, indexOfAPN),
            newAPN,
            ...accessPointNames.slice(indexOfAPN + 1),
        ];

        return {
            ...state,
            accessPointNames: newAccessPointNames,
        };
    }

    return state;
};
