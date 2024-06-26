/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

const activityStatus = {
    0: 'ready',
    1: 'unavailable',
    2: 'unknown',
    3: 'ringing',
    4: 'call in progress',
    5: 'asleep',
};

export type ActivityStatus = keyof typeof activityStatus;

export const processor: Processor<'+CPAS'> = {
    command: '+CPAS',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/mob_termination_ctrl_status/cpas.html',
    initialState: () => ({}),
    onResponse(packet, state) {
        if (packet.status === 'OK') {
            if (packet.payload !== undefined) {
                const status = packet.payload;
                if (Object.keys(activityStatus).includes(status))
                    return {
                        ...state,
                        activityStatus: parseInt(status, 10) as ActivityStatus,
                    };
            }
        }
        return state;
    },
};
