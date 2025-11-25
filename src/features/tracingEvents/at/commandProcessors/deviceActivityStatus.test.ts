/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { initialState } from '..';
import { atPacket, convertPackets } from '../testUtils';

const setCommand = atPacket('AT+CPAS');
const responses = [
    { response: atPacket('+CPAS: 0\r\nOK\r\n'), expected: 0 },
    { response: atPacket('+CPAS: 1\r\nOK\r\n'), expected: 1 },
    { response: atPacket('+CPAS: 2\r\nOK\r\n'), expected: 2 },
    { response: atPacket('+CPAS: 3\r\nOK\r\n'), expected: 3 },
    { response: atPacket('+CPAS: 4\r\nOK\r\n'), expected: 4 },
    { response: atPacket('+CPAS: 5\r\nOK\r\n'), expected: 5 },
];
const incorrectResponses = [
    { response: atPacket('+CPAS: 11\r\nOK\r\n'), expected: 0 },
    { response: atPacket('+CPAS: 12\r\nOK\r\n'), expected: 0 },
    { response: atPacket('+CPAS: 13\r\nOK\r\n'), expected: 0 },
    { response: atPacket('+CPAS: 14\r\nOK\r\n'), expected: 0 },
    { response: atPacket('+CPAS: 15\r\nOK\r\n'), expected: 0 },
];

test('+CPAS set command responds with a single value and sets states successfully', () => {
    responses.forEach(test => {
        expect(convertPackets([setCommand, test.response]).activityStatus).toBe(
            test.expected,
        );
    });
});

test('+CPAS set command responds with a single value and sets states unsuccessfully', () => {
    incorrectResponses.forEach(test => {
        const state = initialState();
        const expectedStatus = state.activityStatus;
        expect(
            convertPackets([setCommand, test.response], state).activityStatus,
        ).toBe(expectedStatus);
    });
});
