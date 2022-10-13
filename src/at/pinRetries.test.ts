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

const ErrorPacket = atPacket('ERROR\r\n');

const setCommandPackets = [
    {
        setCommand: atPacket('AT+CPINR="SIM PIN"'),
        response: atPacket('+CPINR: "SIM PIN",1\r\nOK\r\n'),
        expected: { SIM_PIN: 1 },
    },
    {
        setCommand: atPacket('AT+CPINR="SIM PIN2"'),
        response: atPacket('+CPINR: "SIM PIN2",2\r\nOK\r\n'),
        expected: { SIM_PIN2: 2 },
    },
    {
        setCommand: atPacket('AT+CPINR="SIM PUK"'),
        response: atPacket('+CPINR: "SIM PUK",3\r\nOK\r\n'),
        expected: { SIM_PUK: 3 },
    },
    {
        setCommand: atPacket('AT+CPINR="SIM PUK2"'),
        response: atPacket('+CPINR: "SIM PUK2",4\r\nOK\r\n'),
        expected: { SIM_PUK2: 4 },
    },
    {
        setCommand: atPacket('AT+CPINR="CUSTOM PIN"'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('CPINR set commands work as expected', () => {
    setCommandPackets.forEach(test => {
        expect(
            convertPackets([test.setCommand, test.response]).pinRetries
        ).toEqual(test.expected);
    });
});
