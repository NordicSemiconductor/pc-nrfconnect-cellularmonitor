/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { rawTraceData } from '../../data/trace';
import { convert, initialState, Packet } from '.';

const traceData = rawTraceData.map(
    jsonPacket =>
        ({
            format: jsonPacket.format,
            packet_data: new Uint8Array(jsonPacket.packet_data.data),
        } as Packet)
);

test('Trace is read properly', () => {
    let state = initialState();

    traceData.forEach(packet => {
        state = convert(packet, state);
    });

    expect(state.pinCodeStatus).toBe('READY');
    expect(state.notifySignalQuality).toBe(true);
});
