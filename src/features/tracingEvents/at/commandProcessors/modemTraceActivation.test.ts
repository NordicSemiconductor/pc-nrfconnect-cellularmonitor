/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { State } from '../../types';
import { atPacket, convertPackets } from '../testUtils';

const tests = [
    {
        response: atPacket('AT%XMODEMTRACE=1,1\r\nOK\r\n'),
        expected: { xModemTraceOperation: 1, xModemTraceSetID: 1 },
    },
    {
        response: atPacket('AT%XMODEMTRACE=0\r\nOK\r\n'),
        expected: { xModemTraceOperation: 0 },
    },
];

test('XModemTrace returns correct partial state', () => {
    tests.forEach(test => {
        const result = convertPackets([test.response]);

        Object.entries(test.expected).forEach(([key, value]) => {
            expect(result[key as keyof State]).toBe(value);
        });
    });
});
