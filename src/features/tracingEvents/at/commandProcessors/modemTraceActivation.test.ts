/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { State } from '../../types';
import { atPacket, convertPackets, OkPacket } from '../testUtils';

const tests = [
    {
        commands: [atPacket('AT%XMODEMTRACE=1,1'), OkPacket],
        expected: { xModemTraceOperation: 1, xModemTraceSetID: 1 },
    },
    {
        commands: [atPacket('AT%XMODEMTRACE=0'), OkPacket],
        expected: { xModemTraceOperation: 0 },
    },
];

test('XModemTrace returns correct partial state', () => {
    tests.forEach(test => {
        const result = convertPackets(test.commands);

        Object.entries(test.expected).forEach(([key, value]) => {
            expect(result[key as keyof State]).toBe(value);
        });
    });
});
