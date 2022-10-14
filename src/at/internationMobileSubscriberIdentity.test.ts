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
