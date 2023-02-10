/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, OkPacket } from '../testUtils';

test('+CEDRXRDP eDRX Dynamic Parameters should properly write to state', () => {
    // Initial state
    // let state = convertPackets([]);
    // expect(state.networkTimeNotifications).toBeUndefined();

    let state = convertPackets([atPacket('AT%XTIME=1'), OkPacket]);
    expect(state.networkTimeNotifications).toBe(1);

    state = convertPackets([atPacket('AT%XTIME=0'), OkPacket], state);
    expect(state.networkTimeNotifications).toBe(0);

    state = convertPackets([atPacket('AT%XTIME=1'), OkPacket], state);
    expect(state.networkTimeNotifications).toBe(1);

    let expectedNetworkTime = {
        localTimeZone: '08' as string | undefined,
        universalTime: '81109251714208',
        daylightSavingTime: '01',
    };
    state = convertPackets(
        [atPacket('%XTIME: "08","81109251714208","01"')],
        state
    );
    expect(state.networkTimeNotifications).toBe(1);
    expect(state.networkTimeNotification).toEqual(expectedNetworkTime);

    expectedNetworkTime = {
        localTimeZone: undefined,
        universalTime: '91109251714208',
        daylightSavingTime: '10',
    };
    // Notice in this case we want to overwrite the whole networkTimeNotification object;
    state = convertPackets([atPacket('%XTIME: ,"91109251714208","10"')], state);
    expect(state.networkTimeNotifications).toBe(1);
    expect(state.networkTimeNotification).toEqual(expectedNetworkTime);
});
