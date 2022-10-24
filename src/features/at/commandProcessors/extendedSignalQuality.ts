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
        rsrp_decibel: number;
        rsrq: number;
        rsrq_threshold_index: number;
        rsrq_decibel: number;
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
            rsrp_decibel: 255,
            rsrq: 255,
            rsrq_threshold_index: 255,
            rsrq_decibel: 255,
        },
    }),
    onResponse: (packet, requestType) => {
        if (
            packet.status === 'OK' &&
            requestType === RequestType.SET &&
            packet.payload
        ) {
            const responseArray = getNumberArray(packet.payload);
            return {
                signalQuality: {
                    // Unused,Unused,Unused,Unused,rsrq,rsrp
                    rsrq: responseArray[4],
                    rsrq_decibel: responseArray[4] / 2 - 19.5,
                    rsrp: responseArray[5],
                    rsrp_decibel: responseArray[5] - 140,
                    rsrq_threshold_index: 255, // Not supported by this command, look at %CESQ
                    rsrp_threshold_index: 255, // Not supported  by this command, look at %CESQ
                },
            };
        }
        return {};
    },
};
