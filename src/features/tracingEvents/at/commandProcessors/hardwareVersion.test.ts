/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket } from '../testUtils';

const readCommandPackets = [
    {
        command: atPacket('AT%HWVERSION'),
        response: atPacket('%HWVERSION: nRF9160 SICA B0A\r\nOK\r\n'),
        expected: 'nRF9160 SICA B0A',
    },
    {
        command: atPacket('AT%HWVERSION?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('HWVERSION read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).hardwareVersion,
        ).toEqual(test.expected);
    });
});
