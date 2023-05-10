/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket } from '../testUtils';

const readCommandPackets = [
    {
        command: atPacket('AT+CESQ'),
        response: atPacket('+CESQ: 99,99,255,255,31,62\r\nOK\r\n'),
        expected: {
            rsrq: 31,
            rsrq_decibel: -4,
            rsrp: 62,
            rsrp_decibel: -78,
        },
    },
    {
        // In practice, this tests that the initial state of signalQuality is {}
        command: atPacket('AT+CESQ?'),
        response: ErrorPacket,
        expected: {},
    },
];

test('CESQ read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).signalQuality
        ).toEqual(test.expected);
    });
});
