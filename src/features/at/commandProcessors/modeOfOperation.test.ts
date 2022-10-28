/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket, OkPacket } from '../testUtils';

const readCommandPackets = [
    {
        command: atPacket('AT+CEMODE?'),
        response: atPacket('+CEMODE: 0\r\nOK\r\n'),
        expected: 0,
    },
    {
        command: atPacket('AT+CEMODE?'),
        response: atPacket('+CEMODE: 2\r\nOK\r\n'),
        expected: 2,
    },
];

const testCommandPackets = [
    {
        command: atPacket('AT+CEMODE=?'),
        response: atPacket('+CEMODE: (0,2)\r\nOK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket('AT+CEMODE=?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

const setCommandPackets = [
    { command: atPacket('AT+CEMODE=0'), response: OkPacket, expected: 0 },
    {
        command: atPacket('AT+CEMODE=1'),
        response: ErrorPacket,
        expected: undefined,
    },
    { command: atPacket('AT+CEMODE=2'), response: OkPacket, expected: 2 },
    {
        command: atPacket('AT+CEMODE=3'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('CEMODE set commands work as expected', () => {
    setCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).modeOfOperation
        ).toEqual(test.expected);
    });
});

test('CEMODE read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).modeOfOperation
        ).toEqual(test.expected);
    });
});

test('CEMODE test commands work as expected', () => {
    testCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).modeOfOperation
        ).toEqual(test.expected);
    });
});
