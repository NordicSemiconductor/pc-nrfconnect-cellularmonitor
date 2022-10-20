/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { convert, initialState, Packet, State } from '.';

const encoder = new TextEncoder();
const encode = (txt: string) => Buffer.from(encoder.encode(txt));
export const atPacket = (txt: string): Packet => ({
    format: 'at',
    packet_data: encode(txt),
});

export const OkPacket = atPacket('OK\r\n');
export const ErrorPacket = atPacket('ERROR\r\n');

export const convertPackets = (
    packets: Packet[],
    previousState = initialState()
): State =>
    packets.reduce(
        (state, packet) => ({ ...state, ...convert(packet, state) }),
        previousState
    );
