/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AccessPointName, IPv4Address, IPv6Address } from '../../types';
import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getLines, getNumber, getParametersFromResponse } from '../utils';

export const processor: Processor<'+CGDCONT'> = {
    command: '+CGDCONT',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/packet_domain/cgdcont.html',
    initialState: () => ({ accessPointNames: {} }),
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.READ && packet.payload) {
                const apns = parseResponse(packet.payload);

                if (apns.length === 0) return state;

                const accessPointNames = state.accessPointNames;

                // Filter out `expired` APNs
                const activeApns = Object.keys(accessPointNames).filter(
                    apnKey => apns.find(apn => apn.apn === apnKey)
                );

                state.accessPointNames = activeApns.reduce((acc, apnKey) => {
                    acc[apnKey] = accessPointNames[apnKey];
                    return acc;
                }, {} as { [key: string]: AccessPointName });

                apns.forEach(accessPointName => {
                    if (!accessPointName.apn) return;

                    const alreadyInState =
                        state.accessPointNames[accessPointName.apn];
                    if (alreadyInState) {
                        Object.assign(alreadyInState, accessPointName);
                    } else {
                        state.accessPointNames[accessPointName.apn] =
                            accessPointName;
                    }
                });

                return state;
            }
        }
        return state;
    },
};

const parseResponse = (payload: string): AccessPointName[] => {
    const responseLines = getLines(payload);

    const apns: AccessPointName[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (let line of responseLines) {
        line = line.replace(/\+CGDCONT:/, '').trim();
        const [cid, pdnType, apn, ip] = getParametersFromResponse(line);

        const accessPointName: AccessPointName = {};

        accessPointName.cid = getNumber(cid);
        accessPointName.pdnType = pdnType;
        accessPointName.apn = apn;

        if (pdnType === 'IP' && ip) {
            accessPointName.ipv4 = ip as IPv4Address;
        } else if (pdnType === 'IPV6' && ip) {
            accessPointName.ipv6 = ip as IPv6Address;
        } else if (pdnType === 'IPV4V6' && ip) {
            // TODO: Figure out how we should handle IPv4v6,
            // documentation contain no example.
            accessPointName.ipv4 = ip as IPv4Address;
        }

        apns.push(accessPointName);
    }

    return apns;
};

export default processor;
