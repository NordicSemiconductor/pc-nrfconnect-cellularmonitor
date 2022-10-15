/**
 * @jest-environment node
 */

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
            body: '1,2000,30000',
            requestType: RequestType.SET_WITH_VALUE,
            status: undefined,
        },
    },
    {
        packet: atPacket('OK\r\n'),
        expected: {
            command: undefined,
            body: 'OK\\r\\n',
            requestType: RequestType.NOT_A_REQUEST,
            status: 'OK',
        },
    },
    {
        packet: atPacket('AT%XMODEMTRACE=1,2OK'),
        expected: {
            command: '%XMODEMTRACE',
            body: '1,2OK',
            requestType: RequestType.SET_WITH_VALUE,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN'),
        expected: {
            command: '+CFUN',
            body: undefined,
            requestType: RequestType.SET,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN?'),
        expected: {
            command: '+CFUN',
            body: undefined,
            requestType: RequestType.READ,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN=?'),
        expected: {
            command: '+CFUN',
            body: undefined,
            requestType: RequestType.TEST,
            status: undefined,
        },
    },
    {
        packet: atPacket('%XSYSTEMMODE: 1,0,1,0\r\nOK\r\n'),
        expected: {
            command: '%XSYSTEMMODE',
            requestType: RequestType.NOT_A_REQUEST,
            body: `1,0,1,0\\r\\nOK\\r\\n`,
            status: 'OK',
        },
    },
];

test('parseAT successfully parses packet', () => {
    tests.forEach(test => {
        expect(parseAT(test.packet)).toEqual(test.expected);
    });
});
