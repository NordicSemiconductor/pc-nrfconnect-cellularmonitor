/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets } from '../testUtils';

const subscribePacket = atPacket('AT%XT3412=1,2000,30000');
const unsubscribePacket = atPacket('AT%XT3412=0');

const signalQualityNotifications = [
    { packet: atPacket('%XT3412: 1200000'), result: 1200000 },
];

const OkPacket = atPacket('OK\r\n');

test('Subscribe to %XT3412 signal quality sets correct viewModel', () => {
    expect(convertPackets([subscribePacket, OkPacket]).notifyPeriodicTAU).toBe(
        true
    );
});

test('Subscribe and unsubscribe of %3412 may turned on and off', () => {
    expect(
        convertPackets([subscribePacket, unsubscribePacket]).notifyPeriodicTAU
    ).toBe(false);

    expect(
        convertPackets([
            subscribePacket,
            OkPacket,
            subscribePacket,
            OkPacket,
            subscribePacket,
            OkPacket,
        ]).notifyPeriodicTAU
    ).toBe(true);

    expect(
        convertPackets([
            unsubscribePacket,
            OkPacket,
            unsubscribePacket,
            OkPacket,
            unsubscribePacket,
            OkPacket,
        ]).notifyPeriodicTAU
    ).toBe(false);
});

test('%3412 notification properly updates remaining T3412 time', () => {
    const state = convertPackets([subscribePacket, OkPacket]);
    expect(state.notifyPeriodicTAU).toBe(true);
    expect(state.periodicTAU).toBe(undefined);

    signalQualityNotifications.forEach(notification => {
        expect(convertPackets([notification.packet], state).periodicTAU).toBe(
            notification.result
        );
    });
});
