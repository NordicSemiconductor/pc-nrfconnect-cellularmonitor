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
        (state, packet) => ({ ...state, ...convert(packet, state) }),
        previousState as State
    );

const OkPacket = atPacket('OK\r\n');
const ErrorPacket = atPacket('ERROR\r\n');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const readCommandPackets = [
    {
        readCommand: atPacket('AT+CEMODE?'),
        response: atPacket('+CEMODE: 0\r\nOK\r\n'),
    },
    {
        readCommand: atPacket('AT+CEMODE?'),
        response: atPacket('+CEMODE: 2\r\nOK\r\n'),
    },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testCommandPackets = [
    {
        testCommand: atPacket('AT+CEMODE=?'),
        response: atPacket('+CEMODE: (0,2)\r\nOK\r\n'),
    },
    { testCommand: atPacket('AT+CEMODE=?'), response: ErrorPacket },
];

const setCommandPackets = [
    { setCommand: atPacket('AT+CEMODE=0'), response: OkPacket },
    { setCommand: atPacket('AT+CEMODE=1'), response: ErrorPacket },
    { setCommand: atPacket('AT+CEMODE=2'), response: OkPacket },
    { setCommand: atPacket('AT+CEMODE=3'), response: ErrorPacket },
];

test('CEMODE currently does nothing to the state', () => {
    setCommandPackets.forEach(test => {
        expect(convertPackets([test.setCommand, test.response])).toEqual(
            initialState()
        );
    });
});
