/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket, OkPacket } from './testUtils';

const packets = [
    {
        command: atPacket('AT%XDATAPRFL=1'),
        response: OkPacket,
        expected: 1,
    },
    {
        command: atPacket('AT%XDATAPRFL=1'),
        response: ErrorPacket,
        expected: undefined,
    },
    {
        command: atPacket('AT%XDATAPRFL?'),

        response: atPacket('%XDATAPRFL: 2\r\nOK\r\n'),
        expected: 2,
    },
];

test('XDATAPRFL read commands work as expected', () => {
    packets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).dataProfile
        ).toEqual(test.expected);
    });
});
