/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber, getNumberArray } from '../utils';

export const processor: Processor<'%XCBAND'> = {
    command: '%XCBAND',
    initialState: () => ({}),
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/mob_termination_ctrl_status/xcband.html',
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK' && packet.payload) {
            if (requestType === RequestType.TEST) {
                // Response to a test command, e.g. %XCBAND: (1,2,3,4,5)

                return {
                    ...state,
                    availableBands: getNumberArray(packet.payload),
                };
            }
            if (packet.payload) {
                const band = getNumber(packet.payload);
                return {
                    ...state,
                    band,
                    currentBand: band,
                };
            }
        }
        return state;
    },
};
