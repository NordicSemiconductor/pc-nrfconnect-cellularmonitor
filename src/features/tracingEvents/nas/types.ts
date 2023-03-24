/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    IPv4Address,
    IPv6Address,
    IPv6Partial,
    PowerSavingModeValues,
    RawPDNType,
    Timers,
} from '../types';

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

    pdn?: NrfmlPDN;

    cause?: {
        code: number;
        reason: string;
    };
    raw?: RawTsharkOutput;
};

export type AttachCompletePacket = {
    nas_msg_emm_type: '0x43';
    [timer: `${string}${Timers}${string}`]: PowerSavingModeValues;
    pdn?: NrfmlPDN;
    raw?: RawTsharkOutput;
};

export type AttachRejectPacket = {
    nas_msg_emm_type: '0x44';
    [timer: `${string}${Timers}${string}`]: PowerSavingModeValues;
};

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

export type ConnectivityPacket =
    | PdnConnectivityRequest
    | ActivateDefaultEpsBearerContextRequest
    | ActivateDefaultEpsBearerContextAccept;

export type PdnConnectivityRequest = {
    raw: {
        _source: {
            layers: {
                ['nas-eps']: {
                    'nas_eps.security_header_type': '2';
                    'nas_eps.msg_auth_code': '0x00000000';
                    'nas_eps.seq_no': '0';
                    'nas_eps.bearer_id': '0';
                    'nas_eps.esm.proc_trans_id': '15';
                    'nas_eps.nas_msg_esm_type': '0xd0';
                    'nas_eps.esm_pdn_type': '3';
                    'nas_eps.esm_request_type': '1';
                    'Access Point Name': {
                        'gsm_a.gm.sm.apn': string;
                    };
                };
            };
        };
    };
};

export type ActivateDefaultEpsBearerContextRequest = {
    apn?: string; // Currently I do not think we get it, but we should.
    raw: {
        _source: {
            layers: {
                ['nas-eps']: {
                    // Identifying type:
                    'nas_eps.nas_msg_esm_type': '0xc1';

                    'nas_eps.bearer_id': string; // string as a number ...
                    'Access Point Name': {
                        'gsm_a.gm.sm.apn': string;
                    };
                    'PDN address': {
                        'nas_eps.esm_pdn_type': RawPDNType;
                        'nas_eps.esm.pdn_ipv6_if_id': IPv6Address;
                        'nas_eps.esm.pdn_ipv4': IPv4Address;
                    };
                };
            };
        };
    };
};

export type ActivateDefaultEpsBearerContextAccept = {
    apn?: string; // Currently I do not think we get it, but we should.
    raw: {
        _source: {
            layers: {
                ['nas-eps']: {
                    // Identifying type:
                    'nas_eps.nas_msg_esm_type': '0xc2';

                    'nas_eps.bearer_id': string; // string as a number ...
                    'Access Point Name': {
                        'gsm_a.gm.sm.apn': string;
                    };
                    'PDN address': {
                        'nas_eps.esm_pdn_type': RawPDNType;
                        'nas_eps.esm.pdn_ipv6_if_id': IPv6Address;
                        'nas_eps.esm.pdn_ipv4': IPv4Address;
                    };
                };
            };
        };
    };
};

export type NrfmlPDN = {
    ICMPv6_prefix?: IPv6Partial;
    'nas_eps.esm.pdn_ipv4'?: IPv4Address;
    'nas_eps.esm.pdn_ipv6_if_id'?: IPv6Address;
    'nas_eps.esm_pdn_type'?: RawPDNType;
    'gsm_a.len'?: string;
    'nas_eps.spare_bits'?: string;
};

export type RawTsharkOutput = {
    _source: {
        layers: {
            'nas-eps'?: {
                // Identifying type:
                'nas_eps.nas_msg_esm_type'?: string;

                'nas_eps.bearer_id'?: string; // string as a number ...
                'Access Point Name'?: {
                    'gsm_a.gm.sm.apn'?: string;
                };
                'PDN address'?: {
                    'nas_eps.esm_pdn_type'?: RawPDNType;
                    'nas_eps.esm.pdn_ipv4'?: IPv4Address;
                    ICMPv6_prefix?: string;
                    'nas_eps.esm.pdn_ipv6_if_id'?: IPv6Address;
                };
                'ESM message container'?: {
                    'nas_eps.emm.esm_msg_cont_tree'?: {
                        'nas_eps.bearer_id': string;
                    };
                };
            };
        };
    };
};
