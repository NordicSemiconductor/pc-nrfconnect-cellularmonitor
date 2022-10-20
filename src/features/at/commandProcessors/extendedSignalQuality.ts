/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';

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
            return {
                signalQuality: {
                    // Unused,Unused,Unused,Unused,rsrq,rsrp
                    rsrq: parseInt(packet.body[4], 10),
                    rsrq_threshold_index: 255,
                    rsrp: parseInt(packet.body[5], 10),
                    rsrp_threshold_index: 255,
                },
            };
        }
        return {};
    },
};
