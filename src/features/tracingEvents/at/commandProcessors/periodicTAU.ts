/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { getNumber, getNumberArray } from '../utils';

let parameters: number[];
export const processor: Processor<'%XT3412'> = {
    command: '%XT3412',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xt3412.html',
    initialState: () => ({ notifyPeriodicTAU: false }),

    onRequest: (packet, state) => {
        if (packet.payload) {
            parameters = getNumberArray(packet.payload);
        }
        return state;
    },

    onResponse: (packet, state) => {
        if (packet.status === 'OK') {
            if (parameters[0] === 1) {
                return { ...state, notifyPeriodicTAU: true };
            }
            if (parameters[0] === 0) {
                return { ...state, notifyPeriodicTAU: false };
            }
        }
        return state;
    },

    onNotification: (packet, state) => {
        if (packet.payload) {
            const T3412ExtendedNotification = getNumber(packet.payload);
            return {
                ...state,
                powerSavingMode: {
                    granted: {
                        ...state.powerSavingMode?.granted,
                        T3412ExtendedNotification,
                    },
                },
            };
        }
        return state;
    },
};

export default processor;
