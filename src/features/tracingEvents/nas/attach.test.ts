/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceEvent } from '../../tracing/tracePacketEvents';
import type { State } from '../types';
import {
    AttachAcceptPacket,
    AttachRequestPacket,
    nasConverter,
    parseIPv6Postfix,
    processAttachAcceptPacket,
    processAttachRequestPacket,
} from './index';

test('processAttachRequest sets state', () => {
    const attachRequestPacket =
        actualAttachRequestPacket.jsonData as AttachRequestPacket;
    const actualState = processAttachRequestPacket(attachRequestPacket);

    expect(actualState).toEqual(expectedRequestState);
});

test('processAttachAccept sets correct state', () => {
    const attachAcceptPacket =
        actualAttachAcceptPacket.jsonData as AttachAcceptPacket;
    const actualState = processAttachAcceptPacket(attachAcceptPacket);

    expect(actualState).toEqual(expectedAcceptState);
});

test('Process Request and then Accept sets correct state', () => {
    const expectedState = {
        ...expectedRequestState,
        ...expectedAcceptState,
        powerSavingMode: {
            requested: {
                ...expectedRequestState.powerSavingMode.requested,
            },
            granted: {
                ...expectedAcceptState.powerSavingMode.granted,
            },
        },
    } as Partial<State>;

    let actualState = {};
    [actualAttachRequestPacket, actualAttachAcceptPacket].forEach(packet => {
        actualState = nasConverter(packet, actualState as State);
    });

    expect(actualState).toEqual(expectedState);
});

test('parsePartialIpv6 should return correctly formatted address', () => {
    const toTest = '00:00:00:00:39:a7:3f:79';

    expect(parseIPv6Postfix(toTest)).toBe('0000:0000:39a7:3f79');
});

const expectedRequestState = {
    powerSavingMode: {
        requested: {
            T3324: { bitmask: '00100001', unit: 'minutes', value: 1 },
            T3412_extended: { bitmask: '00000110', unit: 'minutes', value: 60 },
        },
    },
};

const expectedAcceptState = {
    powerSavingMode: {
        granted: {
            T3324: { bitmask: '00100001', unit: 'minutes', value: 1 },
            T3412_extended: { bitmask: '00000110', unit: 'minutes', value: 60 },
            T3402_extended: { bitmask: '00101100', unit: 'minutes', value: 12 },
            T3412: {
                bitmask: '01011111',
                unit: 'seconds',
                value: 186 * 6 * 60,
            },
        },
    },
    accessPointNames: [
        {
            apn: 'telenor.smart.mnc001.mcc242.gprs',
            ipv4: '10.166.181.52',
            ipv6Postfix: '0000:0000:39a7:3f79',
            pdnType: 'IPv4v6',
            rawPDNType: '3',
            ipv6Complete: false,
        },
    ],

    mnc: 'Telenor Norge AS',
    mncCode: 1,
    mcc: 'Norway',
    mccCode: 242,
};
const actualAttachRequestPacket: TraceEvent = {
    data: Uint8Array.from([
        7, 65, 33, 11, 246, 66, 242, 16, 128, 233, 72, 195, 135, 59, 253, 7,
        240, 240, 0, 0, 0, 132, 0, 0, 43, 2, 13, 208, 49, 209, 123, 0, 35, 128,
        128, 33, 16, 1, 6, 0, 16, 129, 6, 0, 0, 0, 0, 131, 6, 0, 0, 0, 0, 0, 13,
        0, 0, 3, 0, 0, 10, 0, 0, 16, 0, 0, 22, 0, 82, 66, 242, 16, 157, 209,
        245, 224, 193, 106, 1, 33, 94, 1, 6, 110, 1, 66,
    ]),
    format: 'NAS',
    jsonData: {
        dns_server_address_config: {
            'Options: (12 bytes), Primary DNS Server IP Address, Secondary DNS Server IP Address':
                {
                    'ipcp.opt.pri_dns': '81:06:00:00:00:00',
                    'ipcp.opt.pri_dns_tree': {
                        'ipcp.opt.length': '6',
                        'ipcp.opt.pri_dns_address': '0.0.0.0',
                        'ipcp.opt.type': '129',
                    },
                    'ipcp.opt.sec_dns': '83:06:00:00:00:00',
                    'ipcp.opt.sec_dns_tree': {
                        'ipcp.opt.length': '6',
                        'ipcp.opt.sec_dns_address': '0.0.0.0',
                        'ipcp.opt.type': '131',
                    },
                },
            'ppp.code': '1',
            'ppp.identifier': '6',
            'ppp.length': '16',
        },
        gprs_timer_2_T3324_value: {
            bitmask: '00100001',
            unit: 'minutes',
            value: 1,
        },
        gprs_timer_3_T3412_extended_value: {
            bitmask: '00000110',
            unit: 'minutes',
            value: 60,
        },
        nas_msg_emm_type: '0x41',
    },
    sequenceNumber: 984,
    timestamp: 1673344465949833,
};

const actualAttachAcceptPacket: TraceEvent = {
    data: Uint8Array.from([
        39, 27, 26, 40, 22, 3, 7, 66, 1, 95, 6, 32, 66, 242, 16, 157, 209, 0,
        142, 82, 13, 193, 1, 9, 33, 7, 116, 101, 108, 101, 110, 111, 114, 5,
        115, 109, 97, 114, 116, 6, 109, 110, 99, 48, 48, 49, 6, 109, 99, 99, 50,
        52, 50, 4, 103, 112, 114, 115, 13, 3, 0, 0, 0, 0, 57, 167, 63, 121, 10,
        166, 181, 52, 94, 2, 151, 135, 145, 123, 0, 81, 128, 128, 33, 16, 3, 6,
        0, 16, 129, 6, 193, 213, 112, 4, 131, 6, 130, 67, 15, 198, 0, 3, 16, 32,
        1, 70, 0, 0, 4, 15, 255, 0, 0, 0, 0, 0, 0, 0, 82, 0, 3, 16, 32, 1, 70,
        0, 0, 4, 31, 255, 0, 0, 0, 0, 0, 0, 0, 82, 0, 13, 4, 193, 213, 112, 4,
        0, 13, 4, 130, 67, 15, 198, 0, 16, 2, 5, 220, 0, 22, 1, 0, 80, 11, 246,
        66, 242, 16, 128, 233, 72, 195, 135, 66, 105, 23, 44, 100, 2, 128, 8,
        244, 94, 1, 6, 106, 1, 33, 110, 1, 66, 224,
    ]),
    format: 'NAS',
    jsonData: {
        accept: '1',
        apn: 'telenor.smart.mnc001.mcc242.gprs',
        apn_aggregate_maximum_bit_rate: {
            APN_AMBR_downlink_kbps: 2048,
            APN_AMBR_uplink_kbps: 1024,
            'gsm_a.len': '2',
            'nas_eps.esm.apn_ambr_dl': '151',
            'nas_eps.esm.apn_ambr_ul': '135',
            'nas_eps.esm.elem_id': '0x5e',
        },
        dns_server_address_config: {
            'Options: (12 bytes), Primary DNS Server IP Address, Secondary DNS Server IP Address':
                {
                    'ipcp.opt.pri_dns': '81:06:c1:d5:70:04',
                    'ipcp.opt.pri_dns_tree': {
                        'ipcp.opt.length': '6',
                        'ipcp.opt.pri_dns_address': '193.213.112.4',
                        'ipcp.opt.type': '129',
                    },
                    'ipcp.opt.sec_dns': '83:06:82:43:0f:c6',
                    'ipcp.opt.sec_dns_tree': {
                        'ipcp.opt.length': '6',
                        'ipcp.opt.sec_dns_address': '130.67.15.198',
                        'ipcp.opt.type': '131',
                    },
                },
            'ppp.code': '3',
            'ppp.identifier': '6',
            'ppp.length': '16',
        },
        gprs_timer_2_T3324_value: {
            bitmask: '00100001',
            unit: 'minutes',
            value: 1,
        },
        gprs_timer_3_T3412_extended_value: {
            bitmask: '00000110',
            unit: 'minutes',
            value: 60,
        },
        gprs_timer_T3402_extended_value: {
            bitmask: '00101100',
            unit: 'minutes',
            value: 12,
        },
        gprs_timer_T3412_value: {
            bitmask: '01011111',
            unit: 'decihours',
            value: 186,
        },
        mcc: 'Norway',
        mcc_code: 242,
        mnc: 'Telenor Norge AS',
        mnc_code: 1,
        nas_msg_emm_type: '0x42',
        pdn: {
            'gsm_a.len': '13',
            'nas_eps.esm.pdn_ipv4': '10.166.181.52',
            'nas_eps.esm.pdn_ipv6_if_id': '00:00:00:00:39:a7:3f:79',
            'nas_eps.esm_pdn_type': '3',
            'nas_eps.spare_bits': '0x00',
        },
        tac: '40401',
    },
    sequenceNumber: 1007,
    timestamp: 1673344467112187,
};