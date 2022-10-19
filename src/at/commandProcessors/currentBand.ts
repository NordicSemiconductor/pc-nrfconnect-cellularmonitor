/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';

type ViewModel = {
    availableBands?: number[];
    currentBand?: number;
};

export const processor: Processor<ViewModel> = {
    command: '%XCBAND',
    initialState: () => ({}),
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xcband.html',
    onResponse: (packet, requestType) => {
        if (packet.status === 'OK' && packet.body) {
            if (requestType === RequestType.TEST) {
                // Response to a test command, e.g. %XCBAND: (1,2,3,4,5)
                const availableBands = packet.body
                    .map(val => val.replace(/[()]/g, ''))
                    .map(band => parseInt(band, 10));

                return { availableBands };
            }
            const currentBand = packet.body.shift();

            // Response to a set command e.g. %XCBAND: 13
            return currentBand
                ? { currentBand: parseInt(currentBand, 10) }
                : {};
        }
        return {};
    },
};
