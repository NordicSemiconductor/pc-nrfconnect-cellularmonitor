/**
 * @jest-environment node
 */
/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { initialState } from '.';
import { atPacket, convertPackets, ErrorPacket, OkPacket } from './testUtils';

const testCommand = {
    request: atPacket('AT+CGSN=?'),
    response: atPacket('+CGSN: (0-3)\r\nOK\r\n'),
};

const setCommand = {
    request: atPacket('AT+CGSN=1'),
    response: atPacket('+CGSN: "352656100367872"\r\nOK\r\n'),
    expected: '352656100367872',
};

const readCommand = atPacket('AT+CGSN?');

test('+CGSN Test Command should not set the IMEI state', () => {
    expect(
        convertPackets([testCommand.request, testCommand.response]).IMEI
    ).toBeUndefined();
});

test('+CGSN Set Command should set the IMEI response value in the state', () => {
    expect(convertPackets([setCommand.request, setCommand.response]).IMEI).toBe(
        setCommand.expected
    );
});

test('+CGSN awaiting request response operator should be correct when mixing commands', () => {
    let state = initialState();
    state = convertPackets([testCommand.request, testCommand.response], state);
    expect(state.IMEI).toBeUndefined();

    state = convertPackets([setCommand.request, setCommand.response], state);
    const expected = setCommand.expected;
    expect(state.IMEI).toBe(expected);

    state = convertPackets([readCommand, ErrorPacket], state);
    expect(state.IMEI).toBe(expected);

    state = convertPackets([testCommand.request, testCommand.response], state);
    expect(state.IMEI).toBe(expected);
});
