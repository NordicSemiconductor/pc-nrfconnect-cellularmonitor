/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { parseAT } from './parseAT';
import { atPacket } from './testUtils';
import { RequestType } from './utils';

const tests = [
    {
        packet: atPacket('AT%XT3412=1,2000,30000'),
        expected: {
            command: '%XT3412',
            body: '1,2000,30000',
            requestType: RequestType.SET_WITH_VALUE,
            lastLine: undefined,
            status: undefined,
        },
    },
    {
        packet: atPacket('OK\r\n'),
        expected: {
            command: undefined,
            body: 'OK\\r\\n',
            requestType: RequestType.NOT_A_REQUEST,
            lastLine: undefined,
            status: 'OK',
        },
    },
    {
        packet: atPacket('AT%XMODEMTRACE=1,2OK'),
        expected: {
            command: '%XMODEMTRACE',
            body: '1,2OK',
            requestType: RequestType.SET_WITH_VALUE,
            lastLine: undefined,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN'),
        expected: {
            command: '+CFUN',
            body: undefined,
            requestType: RequestType.SET,
            lastLine: undefined,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN?'),
        expected: {
            command: '+CFUN',
            body: undefined,
            requestType: RequestType.READ,
            lastLine: undefined,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN=?'),
        expected: {
            command: '+CFUN',
            body: undefined,
            requestType: RequestType.TEST,
            lastLine: undefined,
            status: undefined,
        },
    },
    {
        packet: atPacket('%XSYSTEMMODE: 1,0,1,0\r\nOK\r\n'),
        expected: {
            command: '%XSYSTEMMODE',
            requestType: RequestType.NOT_A_REQUEST,
            body: `1,0,1,0\\r\\nOK\\r\\n`,
            lastLine: 'OK',
            status: 'OK',
        },
    },
];

test('parseAT successfully parses packet', () => {
    tests.forEach(test => {
        expect(parseAT(test.packet)).toEqual(test.expected);
    });
});
