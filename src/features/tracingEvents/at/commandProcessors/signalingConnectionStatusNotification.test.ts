/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket, OkPacket } from '../testUtils';

test('Settings +CSCON notifications and reading notifications, are on 🔥', () => {
    let state = convertPackets([atPacket('AT+CSCON=1'), OkPacket]);
    expect(state.signalingConnectionStatusNotifications).toBe(1);

    state = convertPackets([atPacket('+CSCON: 1'), OkPacket], state);
    expect(state.rrcState).toBe(1);
    state = convertPackets([atPacket('+CSCON: 0'), OkPacket], state);
    expect(state.rrcState).toBe(0);
    state = convertPackets([atPacket('+CSCON: 0'), OkPacket], state);
    expect(state.rrcState).toBe(0);
    state = convertPackets([atPacket('+CSCON: 1'), OkPacket], state);
    expect(state.rrcState).toBe(1);
    state = convertPackets([atPacket('+CSCON: 0'), OkPacket], state);
    expect(state.rrcState).toBe(0);

    state = convertPackets([atPacket('AT+CSCON=0'), OkPacket], state);
    expect(state.signalingConnectionStatusNotifications).toBe(0);

    state = convertPackets([atPacket('AT+CSCON=0'), ErrorPacket], state);
    expect(state.signalingConnectionStatusNotifications).toBe(0);
});

test('Reading +CSCON should set rrcState', () => {
    let state = convertPackets([
        atPacket('AT+CSCON?'),
        atPacket('+CSCON: 0\r\nOK\r\n'),
    ]);
    expect(state.rrcState).toBe(0);

    state = convertPackets([
        atPacket('AT+CSCON?'),
        atPacket('+CSCON: 1\r\nOK\r\n'),
    ]);
    expect(state.rrcState).toBe(1);

    state = convertPackets([
        atPacket('AT+CSCON?'),
        atPacket('+CSCON: 0, 7, 4\r\nOK\r\n'),
    ]);
    expect(state.rrcState).toBe(0);

    state = convertPackets([
        atPacket('AT+CSCON?'),
        atPacket('+CSCON: 1, 7\r\nOK\r\n'),
    ]);
    expect(state.rrcState).toBe(1);
});
