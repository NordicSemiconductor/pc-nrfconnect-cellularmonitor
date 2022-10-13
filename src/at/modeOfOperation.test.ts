/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { convert, initialState, Packet, State } from './index';

const encoder = new TextEncoder();
const encode = (txt: string) => Buffer.from(encoder.encode(txt));
const atPacket = (txt: string): Packet => ({
    format: 'at',
    packet_data: encode(txt),
});

const convertPackets = (
    packets: Packet[],
    previousState = initialState()
): State =>
    packets.reduce(
        (state, packet) => ({ ...state, ...convert(packet, state) } as State),
        previousState as State
    );

const OkPacket = atPacket('OK\r\n');
const ErrorPacket = atPacket('ERROR\r\n');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

test('CEMODE test commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).modeOfOperation
        ).toEqual(test.expected);
    });
});

test('CEMODE read commands work as expected', () => {
    testCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).modeOfOperation
        ).toEqual(test.expected);
    });
});
