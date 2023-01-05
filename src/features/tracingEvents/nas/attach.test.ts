import type { Packet, State } from '../types';
import {
    AttachAcceptPacket,
    AttachRequestPacket,
    nasConverter,
    processAttachAcceptPacket,
    processAttachCompletePacket,
    processAttachRejectPacket,
    processAttachRequestPacket,
} from './index';

const expectedRequestState = {
    powerSavingMode: {
        requested: {
            T3324: { bitmask: '00100001', unit: 'minutes', value: 1 },
            T3412: { bitmask: '00000110', unit: 'minutes', value: 60 },
        },
    },
};
const expectedAcceptState = {
    powerSavingMode: {
        granted: {
            T3402: {
                bitmask: '00101100',
                unit: 'minutes',
                value: 12,
            },
            T3412: {
                bitmask: '01001001',
                unit: 'decihours',
                value: 54,
            },
        },
    },
} as Partial<State>;

test('processAttachRequest sets state', () => {
    const attachRequestPacket = actualAttachRequestPacket.interpreted_json![
        'nas-eps'
    ] as AttachRequestPacket;
    const actualState = processAttachRequestPacket(attachRequestPacket);

    expect(actualState).toEqual(expectedRequestState);
});

test('processAttachAccept sets correct state', () => {
    const attachAcceptPacket = actualAttachAcceptPacket.interpreted_json![
        'nas-eps'
    ] as AttachAcceptPacket;
    const actualState = processAttachAcceptPacket(attachAcceptPacket);

    expect(actualState).toEqual(expectedAcceptState);
});

const actualAttachRequestPacket: Packet = {
    packet_data: Uint8Array.from([
        7, 65, 33, 11, 246, 66, 242, 16, 128, 233, 72, 195, 135, 59, 253, 7,
        240, 240, 0, 0, 0, 132, 0, 0, 43, 2, 13, 208, 49, 209, 123, 0, 35, 128,
        128, 33, 16, 1, 6, 0, 16, 129, 6, 0, 0, 0, 0, 131, 6, 0, 0, 0, 0, 0, 13,
        0, 0, 3, 0, 0, 10, 0, 0, 16, 0, 0, 22, 0, 82, 66, 242, 16, 157, 209,
        245, 224, 193, 106, 1, 33, 94, 1, 6, 110, 1, 66,
    ]),
    format: 'nas-eps',
    type: 'network',
    meta: {
        data_offset: 251105,
        data_size: 251105,
        modem_db_path:
            '/home/adka/.nrfconnect-apps/local/pc-nrfconnect-cellularmonitor/node_modules/@nordicsemiconductor/nrf-monitor-lib-js/config/auto-detect-trace-db-config/mfw_nrf9160_1.3.2_trace-db.json',
        modem_db_uuid: 'c816a44f-c0da-43f3-a72a-92102cd8e13b',
    },
    interpreted_json: {
        'nas-eps': {
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
    },
    sequence_number: 984,
    timestamp: {
        resolution: 'NRFML_TIMESTAMP_MICROSECONDS',
        value: 1673086048533870,
    },
};

const actualAttachAcceptPacket: Packet = {
    packet_data: Uint8Array.from([
        39, 235, 137, 164, 221, 1, 7, 66, 2, 73, 6, 32, 66, 242, 32, 9, 1, 0,
        97, 82, 1, 193, 1, 9, 30, 6, 105, 98, 97, 115, 105, 115, 3, 105, 111,
        116, 6, 109, 110, 99, 48, 48, 56, 6, 109, 99, 99, 50, 48, 52, 4, 103,
        112, 114, 115, 5, 1, 10, 160, 124, 7, 94, 6, 254, 254, 82, 38, 2, 1, 88,
        50, 39, 43, 128, 128, 33, 16, 3, 0, 0, 16, 129, 6, 62, 93, 146, 209,
        131, 6, 216, 168, 184, 184, 0, 22, 1, 0, 0, 13, 4, 62, 93, 146, 209, 0,
        13, 4, 216, 168, 184, 184, 0, 16, 2, 5, 150, 80, 11, 246, 66, 242, 32,
        143, 161, 24, 195, 36, 190, 71, 19, 66, 242, 32, 5, 25, 35, 5, 244, 48,
        9, 212, 157, 23, 44, 242,
    ]),
    format: 'nas-eps',
    type: 'network',
    meta: {
        data_offset: 399312,
        modem_db_path:
            '/home/adka/.nrfconnect-apps/local/pc-nrfconnect-cellularmonitor/node_modules/@nordicsemiconductor/nrf-monitor-lib-js/config/auto-detect-trace-db-config/mfw_nrf9160_1.3.2_trace-db.json',
        modem_db_uuid: 'c816a44f-c0da-43f3-a72a-92102cd8e13b',
    },
    interpreted_json: {
        'nas-eps': {
            accept: '2',
            apn: 'ibasis.iot.mnc008.mcc204.gprs',
            apn_aggregate_maximum_bit_rate: {
                APN_AMBR_downlink_kbps: 8640,
                APN_AMBR_uplink_kbps: 8640,
                'gsm_a.len': '6',
                'nas_eps.esm.apn_ambr_dl': '254',
                'nas_eps.esm.apn_ambr_dl_ext': '82',
                'nas_eps.esm.apn_ambr_dl_ext2': '2',
                'nas_eps.esm.apn_ambr_dl_total': '536000',
                'nas_eps.esm.apn_ambr_ul': '254',
                'nas_eps.esm.apn_ambr_ul_ext': '38',
                'nas_eps.esm.apn_ambr_ul_ext2': '1',
                'nas_eps.esm.apn_ambr_ul_total': '268400',
                'nas_eps.esm.elem_id': '0x5e',
            },
            cause: {
                code: 50,
                reason: 'PDN type IPv4 only allowed',
            },
            dns_server_address_config: {
                'Options: (12 bytes), Primary DNS Server IP Address, Secondary DNS Server IP Address':
                    {
                        'ipcp.opt.pri_dns': '81:06:3e:5d:92:d1',
                        'ipcp.opt.pri_dns_tree': {
                            'ipcp.opt.length': '6',
                            'ipcp.opt.pri_dns_address': '62.93.146.209',
                            'ipcp.opt.type': '129',
                        },
                        'ipcp.opt.sec_dns': '83:06:d8:a8:b8:b8',
                        'ipcp.opt.sec_dns_tree': {
                            'ipcp.opt.length': '6',
                            'ipcp.opt.sec_dns_address': '216.168.184.184',
                            'ipcp.opt.type': '131',
                        },
                    },
                'ppp.code': '3',
                'ppp.identifier': '0',
                'ppp.length': '16',
            },
            gprs_timer_T3402_extended_value: {
                bitmask: '00101100',
                unit: 'minutes',
                value: 12,
            },
            gprs_timer_T3412_value: {
                bitmask: '01001001',
                unit: 'decihours',
                value: 54,
            },
            mcc: 'Norway',
            mcc_code: 242,
            mnc: 'Telia Norge AS',
            mnc_code: 2,
            nas_msg_emm_type: '0x42',
            pdn: {
                'gsm_a.len': '5',
                'nas_eps.esm.pdn_ipv4': '10.160.124.7',
                'nas_eps.esm_pdn_type': '1',
                'nas_eps.spare_bits': '0x00',
            },
            tac: '2305',
        },
    },
    sequence_number: 1252,
    timestamp: {
        resolution: 'NRFML_TIMESTAMP_MICROSECONDS',
        value: 1672919316473076,
    },
};
