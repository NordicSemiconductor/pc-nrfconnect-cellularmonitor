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

const readCommandPackets = [
    {
        command: atPacket('AT+CIMI'),
        response: atPacket('+CIMI: 284011234567890\r\nOK\r\n'),
        expected: '284011234567890',
    },
    {
        command: atPacket('AT+CIMI?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('CIMI read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(convertPackets([test.command, test.response]).imsi).toEqual(
            test.expected
        );
    });
});
