/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceEvent } from '../../tracing/tracePacketEvents';
import { State } from '../types';

export default (packet: TraceEvent, state: State): State => {
    if (packet.networkType) {
        return { ...state, networkType: packet.networkType };
    }

    return state;
};
