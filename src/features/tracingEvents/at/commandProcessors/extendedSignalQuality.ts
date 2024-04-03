/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumberArray } from '../utils';

export const processor: Processor<'+CESQ'> = {
    command: '+CESQ',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/mob_termination_ctrl_status/cesq.html',
    initialState: () => ({
        signalQuality: {},
    }),
    onResponse: (packet, state, requestType) => {
        if (
            packet.status === 'OK' &&
            requestType === RequestType.SET &&
            packet.payload
        ) {
            const responseArray = getNumberArray(packet.payload);
            const [, , , , rsrq, rsrp] = responseArray;
            return {
                ...state,
                signalQuality: {
                    ...state.signalQuality,
                    // Unused,Unused,Unused,Unused,rsrq,rsrp
                    rsrq,
                    rsrq_decibel:
                        rsrq !== 255 ? responseArray[4] / 2 - 19.5 : undefined,
                    rsrp,
                    rsrp_decibel:
                        rsrp !== 255 ? responseArray[5] - 140 : undefined,
                },
            };
        }
        return state;
    },
};
