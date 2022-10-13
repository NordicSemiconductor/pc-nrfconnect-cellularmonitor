/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { convert, Packet, State } from './index';

const encoder = new TextEncoder();
const encode = (txt: string) => Buffer.from(encoder.encode(txt));
const atPacket = (txt: string): Packet => ({
    format: 'at',
    packet_data: encode(txt),
});

const cfunQuestion = atPacket('AT+CFUN');

const cfunPacketReady = atPacket('+CFUN: READY\r\nOK\r\n');

const cfunPacketError = atPacket('ERROR\r\n');

const convertPackets = (...packets: Packet[]): State =>
    packets.reduce(
        (state, packet) => ({ ...state, ...convert(packet, state) } as State),
        <State>{ pinState: 'unknown' }
    );

test('+CFUN event set the pin status correctly', () => {
    const model = convertPackets(cfunPacketReady);
    expect(model.pinState).toBe('ready');
});

test('+CFUN event with error will set pin status accordingly', () => {
    const model = convertPackets(cfunQuestion, cfunPacketError);
    expect(model.pinState).toBe('error');
});
