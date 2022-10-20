/**
 * @jest-environment node
 */
/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, ErrorPacket, OkPacket } from '../testUtils';

const subscribePacket = atPacket('AT%CESQ=1');
const unsubscribePacket = atPacket('AT%CESQ=0');

const signalQualityNotifications = [
    // Same indexes for reference
    { packet: atPacket('%CESQ: 0,0,0,0'), result: [0, 0, 0, 0] },
    { packet: atPacket('%CESQ: 20,0,7,0'), result: [20, 0, 7, 0] },
    { packet: atPacket('%CESQ: 21,1,18,1'), result: [21, 1, 18, 1] },
    { packet: atPacket('%CESQ: 30,1,10,1'), result: [30, 1, 10, 1] },
    { packet: atPacket('%CESQ: 39,1,13,1'), result: [39, 1, 13, 1] },
    { packet: atPacket('%CESQ: 40,2,14,2'), result: [40, 2, 14, 2] },
    { packet: atPacket('%CESQ: 50,2,17,2'), result: [50, 2, 17, 2] },
    { packet: atPacket('%CESQ: 59,2,20,2'), result: [59, 2, 20, 2] },
    { packet: atPacket('%CESQ: 60,3,21,3'), result: [60, 3, 21, 3] },
    { packet: atPacket('%CESQ: 70,3,25,3'), result: [70, 3, 25, 3] },
    { packet: atPacket('%CESQ: 79,3,27,3'), result: [79, 3, 27, 3] },
    { packet: atPacket('%CESQ: 80,4,28,4'), result: [80, 4, 28, 4] },
    { packet: atPacket('%CESQ: 90,4,30,4'), result: [90, 4, 30, 4] },
    { packet: atPacket('%CESQ: 97,4,34,4'), result: [97, 4, 34, 4] },

    // Mixes
    { packet: atPacket('%CESQ: 64,3,17,2'), result: [64, 3, 17, 2] },

    // Unknown
    {
        packet: atPacket('%CESQ: 255,255,255,255'),
        result: [255, 255, 255, 255],
    },
    {
        packet: atPacket('%CESQ: 255,255,17,2'),
        result: [255, 255, 17, 2],
    },
    {
        packet: atPacket('%CESQ: 64,3,255, 255'),
        result: [64, 3, 255, 255],
    },
];

test('Subscribe to %CESQ signal quality sets correct viewModel', () => {
    const model = convertPackets([subscribePacket]);
    expect(model.notifySignalQuality).toBe(false);
    const modelOK = convertPackets([OkPacket], model);
    expect(modelOK.notifySignalQuality).toBe(true);
});

test('Subscribe to %CESQ signal quality followed by error should not write to state', () => {
    expect(
        convertPackets([subscribePacket, ErrorPacket]).notifySignalQuality
    ).toBe(false);
});

test('Notification of %CESQ may turned on and off', () => {
    expect(
        convertPackets([subscribePacket, unsubscribePacket]).notifySignalQuality
    ).toBe(false);

    expect(
        convertPackets([
            subscribePacket,
            OkPacket,
            subscribePacket,
            OkPacket,
            subscribePacket,
            OkPacket,
        ]).notifySignalQuality
    ).toBe(true);

    expect(
        convertPackets([
            unsubscribePacket,
            OkPacket,
            unsubscribePacket,
            OkPacket,
            unsubscribePacket,
            OkPacket,
        ]).notifySignalQuality
    ).toBe(false);
});

test('%CESQ notification properly updates signal quality', () => {
    const state = convertPackets([subscribePacket, OkPacket]);
    expect(state.notifySignalQuality).toBe(true);
    expect(Object.values(state.signalQuality)).toEqual([255, 255, 255, 255]);

    signalQualityNotifications.forEach(notification => {
        const result = convertPackets([notification.packet], state);
        expect(Object.values(result.signalQuality)).toEqual(
            notification.result
        );
    });
});
