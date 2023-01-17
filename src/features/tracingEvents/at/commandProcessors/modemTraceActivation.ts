/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { getParametersFromResponse } from '../utils';

export const processor: Processor = {
    command: '%XMODEMTRACE',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xmodemtrace.html',
    initialState: () => ({}),
    onRequest: packet => {
        if (packet.status === 'OK') {
            const payload = getParametersFromResponse(packet.payload);

            return {
                xModemTraceOperation: Number.parseInt(payload[0], 10),
                xModemTraceSetID:
                    payload.length >= 2
                        ? Number.parseInt(payload[1], 10)
                        : undefined,
            };
        }

        return {};
    },
    onResponse: () => ({}),
};
