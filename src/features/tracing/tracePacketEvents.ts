/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';

import { eventType } from './formats';

export interface Packet {
    packet_data: Uint8Array;
    format: string;
    timestamp?: {
        resolution?: string;
        value?: number;
    };
}
export interface TraceEvent {
    timestamp: number;
    format: eventType;
    data: string;
}

export const tracePacketEvents = new EventEmitter();

export const events: TraceEvent[] = [];

const formatToLabel = (format: string): eventType => {
    if (format.startsWith('lte_rrc')) return 'RRC';
    if (format === 'at') return 'AT';
    if (format.startsWith('nas')) return 'NAS';
    if (format === 'ip') return 'IP';
    if (format === 'ope') return 'POWER';

    return 'OTHER';
};
const packetsToEvent = (packets: Packet[]) =>
    packets.map(
        event =>
            ({
                format: formatToLabel(event.format),
                timestamp: (event.timestamp?.value ?? 0) / 1000,
                data: event.packet_data.toString(),
            } as TraceEvent)
    );

tracePacketEvents.on('new-raw-packets', (packets: Packet[]) => {
    const formattedEvents = packetsToEvent(packets);

    events.push(...formattedEvents);

    tracePacketEvents.emit('new-packets', formattedEvents);
});

tracePacketEvents.on('start-process', () => events.splice(0, events.length));

export const notifyListeners = (packets: Packet[]) =>
    tracePacketEvents.emit('new-raw-packets', packets);
