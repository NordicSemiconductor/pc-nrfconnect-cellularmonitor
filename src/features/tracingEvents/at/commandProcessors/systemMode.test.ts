/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { State } from '../../types';
import { atPacket, convertPackets, OkPacket } from '../testUtils';

const setCommand = {
    commands: [atPacket('AT%XSYSTEMMODE=1,0,1,0'), OkPacket],
    expected: {
        modemSupportLTEM: true,
        modemSupportNBIoT: false,
        modemSupportGNSS: true,
        modemSystemPreference: 0,
    },
};
const readCommand = {
    commands: [
        atPacket('AT%XSYSTEMMODE?'),
        atPacket('%SYSTEMMODE: 1,0,0,0\r\nOK\r\n'),
    ],
    expected: {
        modemSupportLTEM: true,
        modemSupportNBIoT: false,
        modemSupportGNSS: false,
        modemSystemPreference: 0,
    },
};

test('XSystemMode SetCommand returns correct partial state', () => {
    const resultSet = convertPackets(setCommand.commands);

    Object.entries(setCommand.expected).forEach(([key, value]) => {
        expect(resultSet[key as keyof State]).toBe(value);
    });

    const resultRead = convertPackets(readCommand.commands);

    Object.entries(readCommand.expected).forEach(([key, value]) => {
        expect(resultRead[key as keyof State]).toBe(value);
    });
});
