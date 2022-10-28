/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket } from '../testUtils';
import { functionalMode, FunctionalModeSetter } from './functionMode';

const readCommandPackets = [
    ...Object.keys(functionalMode).map(key => ({
        command: atPacket('AT+CFUN?'),
        response: atPacket(`+CFUN: ${key}\r\nOK\r\n`),
        expected: parseInt(key, 10),
    })),
    {
        command: atPacket('AT+CFUN?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

const testCommandPackets = [
    {
        command: atPacket('AT+CFUN=?'),
        response: atPacket('+CFUN: (0,1,4,20,21,30,31,40,41,44)\r\nOK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket('AT+CFUN=?'),
        response: ErrorPacket,
        expected: undefined,
    },
];

const setCommandPackets = [
    {
        command: atPacket(`AT+CFUN=${FunctionalModeSetter.POWER_OFF}`),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(`AT+CFUN=${FunctionalModeSetter.NORMAL_MODE}`),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(`AT+CFUN=${FunctionalModeSetter.FUNCTIONALITY_ONLY}`),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(`AT+CFUN=${FunctionalModeSetter.OFFLINE_MODE}`),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(
            `AT+CFUN=${FunctionalModeSetter.DEACTIVATE_LTE_KEEP_GNSS}`
        ),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(
            `AT+CFUN=${FunctionalModeSetter.ACTIVATE_LTE_KEEP_GNSS}`
        ),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(
            `AT+CFUN=${FunctionalModeSetter.DEACTIVATE_GNSS_KEEP_LTE}`
        ),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(
            `AT+CFUN=${FunctionalModeSetter.ACTIVATE_GNSS_KEEP_LTE}`
        ),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(`AT+CFUN=${FunctionalModeSetter.DEACTIVATE_UICC}`),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(`AT+CFUN=${FunctionalModeSetter.ACTIVATE_UICC}`),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket(`AT+CFUN=${FunctionalModeSetter.OFFLINE_MODE_UICC}`),
        response: atPacket('OK\r\n'),
        expected: undefined,
    },
    {
        command: atPacket('AT+CFUN=45'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('CFUN set commands work as expected', () => {
    setCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).functionalMode
        ).toEqual(test.expected);
    });
});

test('CFUN read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).functionalMode
        ).toEqual(test.expected);
    });
});

test('CFUN test commands work as expected', () => {
    testCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).functionalMode
        ).toEqual(test.expected);
    });
});
