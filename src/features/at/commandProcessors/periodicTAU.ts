/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

export type ViewModel = {
    notifyPeriodicTAU?: boolean;
    periodicTAU?: number;
};
let parameters: number[];
export const processor: Processor<ViewModel> = {
    command: '%XT3412',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xt3412.html',
    initialState: () => ({ notifyPeriodicTAU: false }),

    onRequest: packet => {
        parameters = packet.body.map(val => parseInt(val, 10));
        return {};
    },

    onResponse: packet => {
        if (packet.status === 'OK') {
            if (parameters[0] === 1) {
                return { notifyPeriodicTAU: true };
            }
            if (parameters[0] === 0) {
                return { notifyPeriodicTAU: false };
            }
        }
        return {};
    },

    onNotification: packet => {
        const periodicTAU = packet.body.shift();
        return periodicTAU ? { periodicTAU: parseInt(periodicTAU, 10) } : {};
    },
};

export default processor;
