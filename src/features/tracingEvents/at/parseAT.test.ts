/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setGlobalLineModeDelimiter } from './detectLineEnding';
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
            payload: '0,0,2\r\n1,3,5,2,8,2,13,1',
            status: 'OK',
        },
    },
];

const testsCR = [
    {
        packet: atPacket('OK\r'),
        expected: {
            command: undefined,
            payload: undefined,
            requestType: RequestType.NOT_A_REQUEST,
            status: 'OK',
        },
    },
    {
        packet: atPacket('%XSYSTEMMODE: 1,0,1,0\rOK\r'),
        expected: {
            command: '%XSYSTEMMODE',
            requestType: RequestType.NOT_A_REQUEST,
            payload: '1,0,1,0',
            status: 'OK',
        },
    },
    {
        packet: atPacket('%XEMPR:\r0,0,2\r1,3,5,2,8,2,13,1\rOK\r'),
        expected: {
            command: '%XEMPR',
            requestType: RequestType.NOT_A_REQUEST,
            payload: '0,0,2\r\n1,3,5,2,8,2,13,1', // because of parseAT payloadArray.slice(0, -1).join('\r\n'); line
            status: 'OK',
        },
    },
];

const testsLF = [
    {
        packet: atPacket('OK\n'),
        expected: {
            command: undefined,
            payload: undefined,
            requestType: RequestType.NOT_A_REQUEST,
            status: 'OK',
        },
    },
    {
        packet: atPacket('%XSYSTEMMODE: 1,0,1,0\nOK\n'),
        expected: {
            command: '%XSYSTEMMODE',
            requestType: RequestType.NOT_A_REQUEST,
            payload: '1,0,1,0',
            status: 'OK',
        },
    },
    {
        packet: atPacket('%XEMPR:\n0,0,2\n1,3,5,2,8,2,13,1\nOK\n'),
        expected: {
            command: '%XEMPR',
            requestType: RequestType.NOT_A_REQUEST,
            payload: '0,0,2\r\n1,3,5,2,8,2,13,1', // because of parseAT payloadArray.slice(0, -1).join('\r\n'); line
            status: 'OK',
        },
    },
];

describe('parseAT with default CRLF delimiter', () => {
    test('parseAT successfully parses packet', () => {
        tests.forEach(test => {
            expect(parseAT(test.packet)).toEqual(test.expected);
        });
    });
});

describe('parseAT with CR delimiter', () => {
    beforeAll(() => {
        setGlobalLineModeDelimiter('\r');
    });

    test('parseAT successfully parses packet with CR line ending', () => {
        testsCR.forEach(test => {
            expect(parseAT(test.packet)).toEqual(test.expected);
        });
    });
});

describe('parseAT with LF delimiter', () => {
    beforeAll(() => {
        setGlobalLineModeDelimiter('\n');
    });

    test('parseAT successfully parses packet with LF line ending', () => {
        testsLF.forEach(test => {
            expect(parseAT(test.packet)).toEqual(test.expected);
        });
    });
});
