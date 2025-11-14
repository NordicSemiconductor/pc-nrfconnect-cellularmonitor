/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket } from '../testUtils';
import { functionalMode } from './functionMode';

const readCommandPackets = [
    ...Object.values(functionalMode).map(mode => ({
        command: atPacket('AT+CFUN?'),
        response: atPacket(`+CFUN: ${mode}\r\nOK\r\n`),
        expected: mode,
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
        Fommand: atPacket(`AT+CFUN=${functionalMode.POWER_OFF}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.POWER_OFF,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.NORMAL_MODE}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.NORMAL_MODE,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.FUNCTIONALITY_ONLY}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.FUNCTIONALITY_ONLY,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.OFFLINE_MODE}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.OFFLINE_MODE,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.DEACTIVATE_LTE_KEEP_GNSS}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.DEACTIVATE_LTE_KEEP_GNSS,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.ACTIVATE_LTE_KEEP_GNSS}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.ACTIVATE_LTE_KEEP_GNSS,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.DEACTIVATE_GNSS_KEEP_LTE}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.DEACTIVATE_GNSS_KEEP_LTE,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.ACTIVATE_GNSS_KEEP_LTE}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.ACTIVATE_GNSS_KEEP_LTE,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.DEACTIVATE_UICC}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.DEACTIVATE_UICC,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.ACTIVATE_UICC}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.ACTIVATE_UICC,
    },
    {
        command: atPacket(`AT+CFUN=${functionalMode.OFFLINE_MODE_UICC}`),
        response: atPacket('OK\r\n'),
        expected: functionalMode.OFFLINE_MODE_UICC,
    },
    {
        command: atPacket('AT+CFUN=45'),
        response: ErrorPacket,
        expected: undefined,
    },
];

test('CFUN set commands work as expected', () => {
    setCommandPackets.forEach(test => {
        if (test.command) {
            expect(
                convertPackets([test.command, test.response]).functionalMode,
            ).toEqual(test.expected);
        }
    });
});

test('CFUN read commands work as expected', () => {
    readCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).functionalMode,
        ).toEqual(test.expected);
    });
});

test('CFUN test commands work as expected', () => {
    testCommandPackets.forEach(test => {
        expect(
            convertPackets([test.command, test.response]).functionalMode,
        ).toEqual(test.expected);
    });
});
