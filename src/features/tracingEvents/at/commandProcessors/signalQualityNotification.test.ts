/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { State } from '../../types';
import { atPacket, convertPackets, ErrorPacket, OkPacket } from '../testUtils';

const subscribePacket = atPacket('AT%CESQ=1');
const unsubscribePacket = atPacket('AT%CESQ=0');

const signalQualityNotifications = [
    // Same indexes for reference
    { packet: atPacket('%CESQ: 0,0,0,0'), result: [0, 0, -140, 0, 0, -19.5] },
    { packet: atPacket('%CESQ: 20,0,7,0'), result: [20, 0, -120, 7, 0, -16] },
    {
        packet: atPacket('%CESQ: 21,1,18,1'),
        result: [21, 1, -119, 18, 1, -10.5],
    },
    {
        packet: atPacket('%CESQ: 30,1,10,1'),
        result: [30, 1, -110, 10, 1, -14.5],
    },
    { packet: atPacket('%CESQ: 39,1,13,1'), result: [39, 1, -101, 13, 1, -13] },
    {
        packet: atPacket('%CESQ: 40,2,14,2'),
        result: [40, 2, -100, 14, 2, -12.5],
    },
    { packet: atPacket('%CESQ: 50,2,17,2'), result: [50, 2, -90, 17, 2, -11] },
    { packet: atPacket('%CESQ: 59,2,20,2'), result: [59, 2, -81, 20, 2, -9.5] },
    { packet: atPacket('%CESQ: 60,3,21,3'), result: [60, 3, -80, 21, 3, -9] },
    { packet: atPacket('%CESQ: 70,3,25,3'), result: [70, 3, -70, 25, 3, -7] },
    { packet: atPacket('%CESQ: 79,3,27,3'), result: [79, 3, -61, 27, 3, -6] },
    { packet: atPacket('%CESQ: 80,4,28,4'), result: [80, 4, -60, 28, 4, -5.5] },
    { packet: atPacket('%CESQ: 90,4,30,4'), result: [90, 4, -50, 30, 4, -4.5] },
    { packet: atPacket('%CESQ: 97,4,34,4'), result: [97, 4, -43, 34, 4, -2.5] },

    // Mixes
    { packet: atPacket('%CESQ: 64,3,17,2'), result: [64, 3, -76, 17, 2, -11] },

    // Unknown
    {
        packet: atPacket('%CESQ: 255,255,255,255'),
        result: [255, 255, 115, 255, 255, 108],
    },
    {
        packet: atPacket('%CESQ: 255,255,17,2'),
        result: [255, 255, 115, 17, 2, -11],
    },
    {
        packet: atPacket('%CESQ: 64,3,255, 255'),
        result: [64, 3, -76, 255, 255, 108],
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
    if (state.signalQuality === undefined) {
        expect(state.signalQuality).toBeDefined();
    } else {
        expect(Object.values(state.signalQuality)).toEqual([]);
    }

    signalQualityNotifications.forEach(notification => {
        const result = convertPackets([notification.packet], state);
        if (result.signalQuality === undefined) {
            expect(state.signalQuality).toBeDefined();
        } else {
            expect(Object.values(result.signalQuality)).toEqual(
                notification.result
            );
        }
    });
});

test('%CESQ notification does set snr back to undefined', () => {
    const state = convertPackets(
        [atPacket('AT%CESQ=1'), OkPacket, atPacket('%CESQ: 57,2,8,1')],
        {
            signalQuality: { snr: 13, snr_decibel: 13 - 24 },
        } as State
    );

    expect(state.signalQuality?.snr).toBe(13);
    expect(state.signalQuality?.snr_decibel).toBe(13 - 24);
});
