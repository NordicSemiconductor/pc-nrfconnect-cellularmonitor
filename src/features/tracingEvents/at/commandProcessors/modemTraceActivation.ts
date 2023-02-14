/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getParametersFromResponse } from '../utils';

let setPayload: {
    xModemTraceOperation: number | undefined;
    xModemTraceSetID: number | undefined;
};

export const processor: Processor = {
    command: '%XMODEMTRACE',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xmodemtrace.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (packet.requestType === RequestType.SET_WITH_VALUE) {
            const payload = getParametersFromResponse(packet.payload);
            setPayload = {
                xModemTraceOperation: Number.parseInt(payload[0], 10),
                xModemTraceSetID:
                    payload.length >= 2
                        ? Number.parseInt(payload[1], 10)
                        : undefined,
            };
        }

        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (
            packet.status === 'OK' &&
            requestType === RequestType.SET_WITH_VALUE
        ) {
            return { ...state, ...setPayload };
        }
        return state;
    },
};
