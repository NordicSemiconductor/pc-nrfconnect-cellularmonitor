/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber } from '../utils';

let requestedModeOfOperation = -1;

export const processor: Processor<'+CEMODE'> = {
    command: '+CEMODE',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/cemode.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            requestedModeOfOperation = getNumber(packet.payload);
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (
            packet.status === 'OK' &&
            requestType === RequestType.SET_WITH_VALUE
        ) {
            if (requestedModeOfOperation !== -1) {
                const modeOfOperation = requestedModeOfOperation;
                requestedModeOfOperation = -1;
                return { ...state, modeOfOperation };
            }
            return state;
        }

        if (packet.status === 'OK' && packet.payload) {
            if (requestType === RequestType.READ) {
                return {
                    ...state,
                    modeOfOperation: parseInt(packet.payload, 10),
                };
            }
        }
        return state;
    },
};
