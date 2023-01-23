/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { TraceEvent } from '../tracing/tracePacketEvents';
import ATConverter from './at';
import IPConverter from './ip';
import LTEConverter from './lte';
import NASConverter from './nas';
import type { State } from './types';

export const convert = (packet: TraceEvent, state: State): State => {
    if (packet.format === 'AT') {
        return ATConverter(packet, state);
    }

    if (packet.jsonData) {
        if (packet.format === 'NAS') {
            return NASConverter(packet, state);
        }

        if (packet.format === 'IP') {
            return IPConverter(packet, state);
        }
    }
    if (packet.format === 'RRC') {
        return LTEConverter(packet, state);
    }

    return state;
};
