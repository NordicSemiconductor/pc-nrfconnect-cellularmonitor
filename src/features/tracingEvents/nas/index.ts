/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceEvent } from '../../tracing/tracePacketEvents';
import { State } from '../types';
import attachProcessor, { assertIsAttachPacket } from './attachProcessor';
import connectivityProcessor, {
    assertIsPdnConnectivityPacket,
} from './pdnConnectivityProcessor';

export default (packet: TraceEvent, state: State) => {
    if (packet.jsonData) {
        const packetData: unknown = packet.jsonData;
        if (assertIsAttachPacket(packetData)) {
            return attachProcessor(packetData, state);
        }
        if (assertIsPdnConnectivityPacket(packetData)) {
            return connectivityProcessor(packetData, state);
        }
    }

    return state;
};
