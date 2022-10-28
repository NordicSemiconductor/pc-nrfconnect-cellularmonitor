/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket } from '../testUtils';

const readCommandPackets = [
    {
        command: atPacket('AT+CGMR'),
        response: atPacket('mfw_nrf9160_1.1.1\r\nOK\r\n'),
        expected: 'mfw_nrf9160_1.1.1',
    },
    {
        command: atPacket('AT+CGMR?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('CGMR read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).revisionID
        ).toEqual(test.expected);
    });
});
