/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket } from './testUtils';

const readCommandPackets = [
    {
        command: atPacket('AT+CGMI'),
        response: atPacket('Nordic Semiconductor ASA\r\nOK\r\n'),
        expected: 'Nordic Semiconductor ASA',
    },
    {
        command: atPacket('AT+CGMI?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('CGMI read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).manufacturer
        ).toEqual(test.expected);
    });
});
