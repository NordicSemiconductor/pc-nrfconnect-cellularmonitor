/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumberArray } from '../utils';

type ViewModel = {
    signalQuality: {
        rsrp: number;
        rsrp_threshold_index: number;
        rsrq: number;
        rsrq_threshold_index: number;
    };
};

export const processor: Processor<ViewModel> = {
    command: '+CESQ',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgmi.html',
    initialState: () => ({
        signalQuality: {
            rsrp: 255,
            rsrp_threshold_index: 255,
            rsrq: 255,
            rsrq_threshold_index: 255,
        },
    }),
    onResponse: (packet, requestType) => {
        if (packet.status === 'OK' && requestType === RequestType.SET) {
            if (packet.payload) {
                const responseArray = getNumberArray(packet.payload);
                return {
                    signalQuality: {
                        // Unused,Unused,Unused,Unused,rsrq,rsrp
                        rsrq: responseArray[4],
                        rsrp: responseArray[5],
                        rsrq_threshold_index: 255, // Not supported by this command, look at %CESQ
                        rsrp_threshold_index: 255, // Not supported  by this command, look at %CESQ
                    },
                };
            }
        }
        return {};
    },
};
