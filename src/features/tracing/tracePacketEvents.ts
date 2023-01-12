/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';

import type { AttachPacket } from '../tracingEvents/nas';
import { eventType } from './formats';

export interface Packet {
    packet_data: Uint8Array;
    format: string;
    timestamp?: {
        resolution?: string;
        value?: number;
    };
    sequence_number: number;
    interpreted_json?: unknown;
}
export interface TraceEvent {
    timestamp: number;
    format: eventType;
    sequenceNumber: number;
    data: Uint8Array;
    jsonData?: AttachPacket;
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
                data: event.packet_data,
                sequenceNumber: event.sequence_number,
                jsonData: event.interpreted_json
                    ? parseJsonData(event.interpreted_json)
                    : undefined,
            } as TraceEvent)
    );

tracePacketEvents.on('start-process', () => events.splice(0, events.length));

export const notifyListeners = (packets: Packet[]) => {
    const formattedEvents = packetsToEvent(packets);

    events.push(...formattedEvents);
    tracePacketEvents.emit('new-packets', formattedEvents);
};

const parseJsonData = (data: unknown): AttachPacket | undefined => {
    if (data == null) return undefined;

    if (typeof data === 'object' && 'nas-eps' in data) {
        return data['nas-eps'] as AttachPacket;
    }

    return undefined;
};
