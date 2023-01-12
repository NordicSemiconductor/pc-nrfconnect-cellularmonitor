/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '../..';
import { RequestType } from '../parseAT';
import { getNumber, getNumberArray } from '../utils';

export const processor: Processor = {
    command: '%XCBAND',
    initialState: () => ({}),
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xcband.html',
    onResponse: (packet, requestType) => {
        if (packet.status === 'OK' && packet.payload) {
            if (requestType === RequestType.TEST) {
                // Response to a test command, e.g. %XCBAND: (1,2,3,4,5)

                return { availableBands: getNumberArray(packet.payload) };
            }
            return { currentBand: getNumber(packet.payload) };

            // Response to a set command e.g. %XCBAND: 13
        }
        return {};
    },
};
