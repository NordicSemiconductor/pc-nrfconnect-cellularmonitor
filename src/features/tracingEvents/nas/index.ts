/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
/* eslint-disable radix */

import {
    parsePowerSavingMode,
    TAU_TYPES,
} from '../../../utils/powerSavingMode';
import { TraceEvent } from '../../tracing/tracePacketEvents';
import {
    AccessPointName,
    IPv4Address,
    IPv6Address,
    parseCrudePDN as parseRawPDNType,
    parsePDNType,
    PowerSavingModeEntries,
    PowerSavingModeValues,
    State,
    TimerKey,
    Timers,
} from '../types';

const attachValues = [
    '0x41',
    '0x42',
    '0x43',
    '0x44',
    '65',
    '66',
    '67',
    '68',
] as const;

// Only relevant timers for PSM
const timers: Timers[] = [
    'T3324', // Active Timer
    'T3412Extended', // Periodic TAU
    'T3412', // Periodic TAU (legacy)
    // 'T3402',
    // 'T3324Extended',
    // 'T3402Extended',
];

export type AttachPacket =
    | AttachRequestPacket
    | AttachAcceptPacket
    | AttachCompletePacket
    | AttachRejectPacket;

export type AttachRequestPacket = {
    nas_msg_emm_type: '0x41';
    dns_server_address_config: DNSServerAddressConfig;
    [timer: `${string}${Timers}${string}`]: PowerSavingModeValues;
};

export type AttachAcceptPacket = {
    nas_msg_emm_type: '0x42';
    accept: `${number}`;
    apn: string;
    mcc: string;
    mcc_code: number;
    mnc: string;
    mnc_code: number;
    tac: `${number}`;

    apn_aggregate_maximum_bit_rate: {
        APN_AMBR_downlink_kbps: number;
        APN_AMBR_uplink_kbps: number;
        [key: `${string}.${string}`]: `${number}`;
    };

    dns_server_address_config: DNSServerAddressConfig;

    [timer: `${string}${Timers}${string}`]: PowerSavingModeValues;

    pdn?: {
        ICMPv6_prefix?: string;
        'gsm_a.len'?: `${number}`;
        'nas_eps.esm.pdn_ipv4'?: IPv4Address;
        'nas_eps.esm.pdn_ipv6_if_id'?: IPv6Address;
        'nas_eps.esm_pdn_type'?: `${number}`; // Type 1, 2, 3 ... ?
        'nas_eps.spare_bits'?: '0x00'; // Don't know if it's necessary?
    };

    cause?: {
        code: number;
        reason: string;
    };
};

export type AttachCompletePacket = {
    nas_msg_emm_type: '0x43';
    [timer: `${string}${Timers}${string}`]: PowerSavingModeValues;
};

export type AttachRejectPacket = {
    nas_msg_emm_type: '0x44';
    [timer: `${string}${Timers}${string}`]: PowerSavingModeValues;
};

const assertIsAttachPacket = (packet: unknown): packet is AttachPacket => {
    if (packet && (packet as AttachPacket).nas_msg_emm_type) {
        return attachValues.some(
            type => (packet as AttachPacket).nas_msg_emm_type === type
        );
    }

    return false;
};

const assertIsAttachRequestPacket = (
    packet: AttachPacket
): packet is AttachRequestPacket => parseInt(packet.nas_msg_emm_type) === 65; // '0x41' or '65';

const assertIsAttachAcceptPacket = (
    packet: AttachPacket
): packet is AttachAcceptPacket => parseInt(packet.nas_msg_emm_type) === 66; // '0x42' or '66';

const assertIsAttachCompletePacket = (
    packet: AttachPacket
): packet is AttachCompletePacket => parseInt(packet.nas_msg_emm_type) === 67; // '0x43' or '67';

const assertIsAttachRejectPacket = (
    packet: AttachPacket
): packet is AttachRejectPacket => parseInt(packet.nas_msg_emm_type) === 68; // '0x44' or '68';

export default (packet: TraceEvent, state: State) => {
    if (packet.jsonData) {
        const attach: unknown = packet.jsonData;
        if (assertIsAttachPacket(attach)) {
            if (assertIsAttachRequestPacket(attach)) {
                const processedState = processAttachRequestPacket(attach);
                return {
                    ...state,
                    ...processedState,
                    powerSavingMode: {
                        requested: {
                            ...processedState.powerSavingMode?.requested,
                        },
                        granted: {
                            ...state.powerSavingMode?.granted,
                        },
                    },
                };
            }

            if (assertIsAttachAcceptPacket(attach)) {
                const processedState = processAttachAcceptPacket(attach);
                return {
                    ...state,
                    ...processAttachAcceptPacket(attach),
                    powerSavingMode: {
                        requested: {
                            ...state.powerSavingMode?.requested,
                        },
                        granted: {
                            ...processedState?.powerSavingMode?.granted,
                        },
                    },
                };
            }

            if (assertIsAttachCompletePacket(attach)) {
                return {
                    ...state,
                    ...processAttachCompletePacket(attach),
                };
            }

            if (assertIsAttachRejectPacket(attach)) {
                return {
                    ...state,
                    ...processAttachRejectPacket(attach),
                };
            }
        }
    }

    return state;
};

const getKeyOfPacket = (
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

const getPowerSavingEntriesFromPacket = (packet: AttachPacket) =>
    timers.reduce<PowerSavingModeEntries>((PsmEntries, lookupKey) => {
        const key = getKeyOfPacket(packet, lookupKey);
        if (key) {
            if (lookupKey === 'T3324') {
                PsmEntries[lookupKey] = parsePowerSavingMode(
                    packet[key].bitmask,
                    TAU_TYPES.ACTIVE_TIMER
                );
            } else if (lookupKey === 'T3412' || lookupKey === 'T3412Extended') {
                PsmEntries[lookupKey] = parsePowerSavingMode(
                    packet[key].bitmask,
                    TAU_TYPES.SLEEP_INTERVAL
                );
            }
        }
        return PsmEntries;
    }, {});

export const processAttachRequestPacket = (
    packet: AttachRequestPacket
): Partial<State> => ({
    powerSavingMode: {
        requested: getPowerSavingEntriesFromPacket(packet),
    },
});

export const parseIPv6Postfix = (postfix: string | undefined) => {
    if (postfix == null) return;

    const addr = postfix.split(':');
    // Wrongly formatted address?
    if (addr.length !== 8) return undefined;
    return `${addr[0]}${addr[1]}:${addr[2]}${addr[3]}:${addr[4]}${addr[5]}:${addr[6]}${addr[7]}`;
};

export const parsePDN = (packet: AttachAcceptPacket): AccessPointName => {
    const pdnObj = packet.pdn;

    let pdnPartial: Partial<AccessPointName> = {};
    if (pdnObj) {
        const rawPDNType = parseRawPDNType(
            packet.pdn?.['nas_eps.esm_pdn_type']
        );
        pdnPartial = {
            rawPDNType,
            pdnType: parsePDNType(rawPDNType),
            ipv4: pdnObj['nas_eps.esm.pdn_ipv4'],
            ipv6Postfix: parseIPv6Postfix(
                pdnObj['nas_eps.esm.pdn_ipv6_if_id']
            ) as IPv6Address,
        };
    }

    return {
        apn: packet.apn,
        ...pdnPartial,
        ipv6Complete: false,
    };
};

export const processAttachAcceptPacket = (
    packet: AttachAcceptPacket
): Partial<State> => ({
    powerSavingMode: {
        granted: getPowerSavingEntriesFromPacket(packet),
    },
    accessPointNames: [parsePDN(packet)],
    mnc: packet.mnc,
    mncCode: packet.mnc_code,
    mcc: packet.mcc,
    mccCode: packet.mcc_code,
});

// TODO: Must decide if this is needed at all?
export const processAttachCompletePacket = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    packet: AttachCompletePacket
): Partial<State> => ({});

// Should report that attach was rejected.
export const processAttachRejectPacket = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    packet: AttachRejectPacket
): Partial<State> => ({});

type DNSServerAddressConfig = {
    [key: `Options:${string}`]: {
        'ipcp.opt.pri_dns': string;
        'ipcp.opt.pri_dns_tree': {
            'ipcp.opt.length': `${number}`;
            'ipcp.opt.pri_dns_address': DNS_Address;
            'ipcp.opt.type': `${number}`;
        };
        'ipcp.opt.sec_dns': string;
        'ipcp.opt.sec_dns_tree': {
            'ipcp.opt.length': `${number}`;
            'ipcp.opt.sec_dns_address': DNS_Address;
            'ipcp.opt.type': `${number}`;
        };
    };
    [key: `ppp.${string}`]: `${number}`;
};

type DNS_Address = `${number}.${number}.${number}.${number}`;
