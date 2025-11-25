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
            convertPackets([test.command, test.response]).signalQuality,
        ).toEqual(test.expected);
    });
});

test('CESQ rsrq and rsrp with index 255 do not yield a decibel value', () => {
    const state = convertPackets([
        atPacket('AT+CESQ'),
        atPacket('+CESQ: 255,255,255,255,255,255\r\nOK\r\n'),
    ]);
    expect(state.signalQuality?.rsrq).toBe(255);
    expect(state.signalQuality?.rsrq_decibel).toBeUndefined();
    expect(state.signalQuality?.rsrp).toBe(255);
    expect(state.signalQuality?.rsrp_decibel).toBeUndefined();
});
