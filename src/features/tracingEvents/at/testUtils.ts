/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceEvent } from '../../tracing/tracePacketEvents';
import { convert } from '..';
import { State } from '../types';
import { initialState } from '.';

const encoder = new TextEncoder();
const encode = (txt: string) => Buffer.from(encoder.encode(txt));
export const atPacket = (txt: string): TraceEvent => ({
    format: 'AT',
    data: encode(txt),
    timestamp: 0,
    sequenceNumber: 1,
});

export const OkPacket = atPacket('OK\r\n');
export const ErrorPacket = atPacket('ERROR\r\n');

export const convertPackets = (
    packets: TraceEvent[],
    previousState = initialState(),
): State =>
    packets.reduce((state, packet) => convert(packet, state), previousState);
