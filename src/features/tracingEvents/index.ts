/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { TraceEvent } from '../tracing/tracePacketEvents';
import ATConverter from './at';
import type { State } from './types';

export const convert = (packet: TraceEvent, state: State): State => {
    if (packet.format === 'AT') {
        return ATConverter(packet, state);
    }

    return state;
};
