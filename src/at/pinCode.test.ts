/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets } from './testUtils';

const cpinQuestion = atPacket('AT+CPIN');

const readResponseTests = [
    { response: atPacket('+CPIN: READY\r\nOK\r\n'), expected: 'READY' },
    { response: atPacket('+CPIN: SIM PUN\r\nOK\r\n'), expected: 'SIM PUN' },
    { response: atPacket('+CPIN: SIM PIN\r\nOK\r\n'), expected: 'SIM PIN' },
    { response: atPacket('+CPIN: SIM PUK\r\nOK\r\n'), expected: 'SIM PUK' },
    { response: atPacket('+CPIN: SIM PIN2\r\nOK\r\n'), expected: 'SIM PIN2' },
    {
        response: atPacket('+CPIN: PH-SIM PIN\r\nOK\r\n'),
        expected: 'PH-SIM PIN',
    },
    {
        response: atPacket('+CPIN: PH-NET PIN\r\nOK\r\n'),
        expected: 'PH-NET PIN',
    },
    {
        response: atPacket('+CPIN: PH-NETSUB PIN\r\nOK\r\n'),
        expected: 'PH-NETSUB PIN',
    },
    { response: atPacket('+CPIN: PH-SP PIN\r\nOK\r\n'), expected: 'PH-SP PIN' },
    {
        response: atPacket('+CPIN: PH-CORP PIN\r\nOK\r\n'),
        expected: 'PH-CORP PIN',
    },
    {
        response: atPacket('+CPIN: GIBBERISH PIN\r\nOK\r\n'),
        expected: 'unknown',
    },
    {
        response: atPacket('+CPIN: GIBBERISH\r\nOK\r\n'),
        expected: 'unknown',
    },
    {
        response: atPacket('+CPIN: PIN\r\nOK\r\n'),
        expected: 'unknown',
    },
    {
        response: atPacket('+CPIN: PIN GIBBERISH\r\nOK\r\n'),
        expected: 'unknown',
    },
];

test('+CPIN read command responses sets the pinCodeState appropriately', () => {
    readResponseTests.forEach(test => {
        expect(
            convertPackets([cpinQuestion, test.response]).pinCodeStatus
        ).toBe(test.expected);
    });
});
