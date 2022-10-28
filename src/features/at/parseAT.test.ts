/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { parseAT, RequestType } from './parseAT';
import { atPacket } from './testUtils';

const tests = [
    {
        packet: atPacket('AT%XT3412=1,2000,30000'),
        expected: {
            command: '%XT3412',
            payload: '1,2000,30000',
            requestType: RequestType.SET_WITH_VALUE,
            status: undefined,
        },
    },
    {
        packet: atPacket('OK\r\n'),
        expected: {
            command: undefined,
            payload: undefined,
            requestType: RequestType.NOT_A_REQUEST,
            status: 'OK',
        },
    },
    {
        packet: atPacket('AT%XMODEMTRACE=1,2'),
        expected: {
            command: '%XMODEMTRACE',
            payload: '1,2',
            requestType: RequestType.SET_WITH_VALUE,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN'),
        expected: {
            command: '+CFUN',
            payload: undefined,
            requestType: RequestType.SET,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN?'),
        expected: {
            command: '+CFUN',
            payload: undefined,
            requestType: RequestType.READ,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN=?'),
        expected: {
            command: '+CFUN',
            payload: undefined,
            requestType: RequestType.TEST,
            status: undefined,
        },
    },
    {
        packet: atPacket('%XSYSTEMMODE: 1,0,1,0\r\nOK\r\n'),
        expected: {
            command: '%XSYSTEMMODE',
            requestType: RequestType.NOT_A_REQUEST,
            payload: '1,0,1,0',
            status: 'OK',
        },
    },
    {
        packet: atPacket('%XEMPR:\r\n0,0,2\r\n1,3,5,2,8,2,13,1\r\nOK\r\n'),
        expected: {
            command: '%XEMPR',
            requestType: RequestType.NOT_A_REQUEST,
            payload: '0,0,2,1,3,5,2,8,2,13,1',
            status: 'OK',
        },
    },
];

test('parseAT successfully parses packet', () => {
    tests.forEach(test => {
        expect(parseAT(test.packet)).toEqual(test.expected);
    });
});
