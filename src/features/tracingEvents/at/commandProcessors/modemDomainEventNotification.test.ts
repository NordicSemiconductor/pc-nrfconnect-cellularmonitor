/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, OkPacket } from '../testUtils';

test('AT%MDMEV updates the domainEvents state when notifications are received.', () => {
    let state = convertPackets([atPacket('AT%MDMEV=1'), OkPacket]);
    expect(state.mdmevNotification).toBe(1);

    state = convertPackets([
        atPacket('%MDMEV: ME OVERHEATED'),
        atPacket('%MDMEV: ME BATTERY LOW'),
        atPacket('%MDMEV: SEARCH STATUS 1'),
    ]);

    expect(state.meOverheated).toBe(true);
    expect(state.meBatteryLow).toBe(true);
    expect(state.searchStatus1).toBe(true);

    state = convertPackets([atPacket('%MDMEV: ME OVERHEATED')], state);

    expect(state.meOverheated).toBe(true);
    expect(state.resetLoop).toBeUndefined();

    state = convertPackets([atPacket('%MDMEV: RESET LOOP')], state);

    expect(state.resetLoop).toBe(true);
});
