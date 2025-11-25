/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket } from '../testUtils';

const readCommandPackets = [
    {
        command: atPacket('AT%XICCID'),
        response: atPacket('%XICCID: 8901234567012345678F\r\nOK\r\n'),
        expected: '8901234567012345678F',
    },
    {
        command: atPacket('AT%XICCID?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('ICCID read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(convertPackets([test.command, test.response]).iccid).toEqual(
            test.expected,
        );
    });
});
