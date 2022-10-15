/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { getNumberList, getParametersFromResponse } from './utils';

export type ViewModel = {
    notifyPeriodicTAU?: boolean;
    periodicTAU?: number;
};
let parameters: number[];
export const processor: Processor<ViewModel> = {
    command: '%XT3412',
    documentation:
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fxt3412.html',
    initialState: () => ({ notifyPeriodicTAU: false }),

    request: packet => {
        parameters = getNumberList(packet.body);
        return {};
    },

    response: packet => {
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

    notification: packet => {
        const periodicTAU = getParametersFromResponse(packet.body)?.pop();
        return periodicTAU ? { periodicTAU: parseInt(periodicTAU, 10) } : {};
    },
};

export default processor;
