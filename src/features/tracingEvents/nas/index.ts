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

const attachValues = ['0x41', '0x42', '0x43', '0x44'] as const;

// Just fill in all the values of the Timers type
const timers: Timers[] = [
    'T3324',
    'T3402',
    'T3412',
    'T3324_extended',
    'T3402_extended',
    'T3412_extended',
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

    // Super relevant ATM
    [timer: `${string}${Timers}${string}`]: PowerSavingModeValues;

    pdn?: {
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

const assertIsAttachPacket = (packet: any): packet is AttachPacket => {
    if ('nas_msg_emm_type' in packet) {
        if (attachValues.includes(packet.nas_msg_emm_type)) {
            return true;
        }
    }

    return false;
};

const assertIsAttachRequestPacket = (
    packet: AttachPacket
): packet is AttachRequestPacket => packet.nas_msg_emm_type === '0x41';

const assertIsAttachAcceptPacket = (
    packet: AttachPacket
): packet is AttachAcceptPacket => packet.nas_msg_emm_type === '0x42';

const assertIsAttachCompletePacket = (
    packet: AttachPacket
): packet is AttachCompletePacket => packet.nas_msg_emm_type === '0x43';

const assertIsAttachRejectPacket = (
    packet: AttachPacket
): packet is AttachRejectPacket => packet.nas_msg_emm_type === '0x44';

export const nasConverter = (packet: TraceEvent, state: State) => {
    if (packet.interpreted_json && 'nas-eps' in packet.interpreted_json) {
        const attach: unknown = packet.interpreted_json['nas-eps'];
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
    const predicate = lookup.includes('extended')
        ? (key: string) => key.includes(lookup)
        : (key: string) => key.includes(lookup) && !key.includes('extended');
    return Object.keys(packet).find(key => predicate(key)) as
        | TimerKey
        | undefined;
};

const parsePSMValues = (
    values: PowerSavingModeValues
): PowerSavingModeValues => {
    if (values.unit && values.value && values.unit === 'decihours') {
        // Convert decihours to seconds
        // 1 decihour = 6 minutes
        return {
            bitmask: values.bitmask,
            unit: 'seconds',
            value: values.value * 6 * 60,
        };
    }

    return values;
};

const getPowerSavingEntriesFromPacket = (packet: AttachPacket) =>
    timers.reduce((previous, lookup) => {
        const key = getKeyOfPacket(packet, lookup);
        if (key) {
            previous[lookup] = parsePSMValues(packet[key]);
        }
        return previous;
    }, {} as PowerSavingModeEntries);

export const processAttachRequestPacket = (
    packet: AttachRequestPacket
): Partial<State> => ({
    powerSavingMode: {
        requested: getPowerSavingEntriesFromPacket(packet),
    },
});

const parsePDN = (packet: AttachAcceptPacket): AccessPointName => {
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
            ipv6Postfix: pdnObj['nas_eps.esm.pdn_ipv6_if_id'],
        };
    }

    return {
        apn: packet.apn,
        ...pdnPartial,
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
    packet: AttachCompletePacket
): Partial<State> => {};

// Should report that attach was rejected.
export const processAttachRejectPacket = (
    packet: AttachRejectPacket
): Partial<State> => {};

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
