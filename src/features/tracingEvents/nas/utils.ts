/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
/* eslint-disable no-underscore-dangle */

import {
    AccessPointName,
    IPv6Address,
    parsePDNType,
    parseRawPDN,
    TimerKey,
    Timers,
} from '../types';
import { AttachPacket, NrfmlPDN, RawTsharkOutput } from './types';

export const matchPacketIdWithHexValues = (
    hexValueList: readonly number[],
    valueToCompare: number
) => hexValueList.some(hexValue => hexValue === valueToCompare);

export const parseIPv6Postfix = (postfix: string | undefined) => {
    if (postfix == null) return;

    const addr = postfix.split(':');
    // Wrongly formatted address?
    if (addr.length !== 8) return undefined;
    return `${addr[0]}${addr[1]}:${addr[2]}${addr[3]}:${addr[4]}${addr[5]}:${addr[6]}${addr[7]}`;
};

export const extractApnFromRaw = (rawTsharkOutput?: RawTsharkOutput) =>
    rawTsharkOutput?._source?.layers?.['nas-eps']?.['Access Point Name']?.[
        'gsm_a.gm.sm.apn'
    ];

export const prettifyApn = (apn: string) => {
    const apnParts = apn.split('.');
    const apnEnd = apnParts.findIndex(value => value.startsWith('mnc'));
    if (apnEnd > 0) {
        return apnParts.slice(0, apnEnd).join('.');
    }
    return apn;
};

export const extractPdnInfo = (packet: {
    apn?: string;
    pdn?: NrfmlPDN;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw?: any;
}) => {
    let pdnInfo: AccessPointName = {};

    const apnName = packet.apn ?? extractApnFromRaw(packet.raw);
    if (apnName) {
        pdnInfo.apn = prettifyApn(apnName);
    }

    const nrfmlPdn = packet.pdn;
    if (nrfmlPdn) {
        pdnInfo = { ...pdnInfo, ...parsedPdnInfo(nrfmlPdn) };
    }

    const rawData = packet.raw;
    if (rawData) {
        pdnInfo = { ...pdnInfo, ...parsedRawPdnInfo(rawData) };
    }

    return pdnInfo;
};

const parsedPdnInfo = (pdnObject: NrfmlPDN) => {
    let pdnInfo: Partial<AccessPointName> = {};
    const rawPdn = pdnObject['nas_eps.esm_pdn_type'];
    const rawPDNType = rawPdn ? parseRawPDN(rawPdn) : undefined;
    pdnInfo = {
        rawPDNType,
        ipv4: pdnObject['nas_eps.esm.pdn_ipv4'],
        ipv6Postfix: parseIPv6Postfix(
            pdnObject['nas_eps.esm.pdn_ipv6_if_id']
        ) as IPv6Address,
    };

    if (rawPDNType) {
        pdnInfo.pdnType = parsePDNType(rawPDNType);
    }

    return {
        ...pdnInfo,
        ipv6Complete: false,
    };
};

const parsedRawPdnInfo = (rawTsharkOutput: RawTsharkOutput) => {
    const pdnInfo: AccessPointName = {};

    const bearerId =
        rawTsharkOutput._source.layers['nas-eps']?.['nas_eps.bearer_id'] ??
        rawTsharkOutput._source.layers['nas-eps']?.['ESM message container']?.[
            'nas_eps.emm.esm_msg_cont_tree'
        ]?.['nas_eps.bearer_id'];
    if (bearerId) {
        pdnInfo.bearerId = bearerId;
    }

    return pdnInfo;
};

export const getApnNameFromBearerId = (
    bearerId: string,
    accessPointNames: { [key: string]: AccessPointName }
) => {
    const accessPointName = Object.values(accessPointNames).find(
        apn => apn.bearerId === bearerId
    );
    return accessPointName?.apn;
};

export const updateAccessPointNames = (
    accessPointName: AccessPointName,
    accessPointNames: undefined | { [apn: string]: AccessPointName }
): { [apn: string]: AccessPointName } => {
    if (accessPointNames == null) {
        accessPointNames = {};
    }
    let pdnName = accessPointName.apn;
    if (pdnName == null && accessPointName.bearerId != null) {
        pdnName = getApnNameFromBearerId(
            accessPointName.bearerId,
            accessPointNames
        );
    }
    if (pdnName != null) {
        accessPointNames[pdnName] = {
            ...accessPointNames[pdnName],
            ...accessPointName,
        };
    }

    return accessPointNames;
};

export const getKeyOfPacket = (
    packet: AttachPacket,
    lookup: Timers
): TimerKey | undefined => {
    const predicate = lookup.includes('Extended')
        ? (key: string) => key.includes(lookup.replace('Extended', '_extended'))
        : (key: string) => key.includes(lookup) && !key.includes('extended');
    return Object.keys(packet).find(key => predicate(key)) as
        | TimerKey
        | undefined;
};
