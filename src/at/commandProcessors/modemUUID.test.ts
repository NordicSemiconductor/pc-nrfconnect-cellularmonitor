/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket } from '../testUtils';

const readCommandPackets = [
    {
        command: atPacket('AT%XMODEMUUID'),
        response: atPacket(
            '%XMODEMUUID: 25c95751-efa4-40d4-8b4a-1dcaab81fac9\r\nOK\r\n'
        ),
        expected: '25c95751-efa4-40d4-8b4a-1dcaab81fac9',
    },
    {
        command: atPacket('AT%XMODEMUUID?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('XMODEMUUID read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(convertPackets([test.command, test.response]).modemUUID).toEqual(
            test.expected
        );
    });
});
