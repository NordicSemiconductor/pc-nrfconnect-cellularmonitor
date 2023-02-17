/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';

export const PowerLevel = {
    0: 'Ultra-low power',
    1: 'Low power',
    2: 'Normal',
    3: 'Performance',
    4: 'High performance',
};

export type PowerLevel = keyof typeof PowerLevel;

let requestedDataProfile: PowerLevel | undefined;

export const processor: Processor<'%XDATAPRFL'> = {
    command: '%XDATAPRFL',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xdataprfl.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (packet.payload) {
            const powerLevel = Object.keys(PowerLevel).find(
                key => key === packet.payload
            );
            requestedDataProfile = powerLevel
                ? (parseInt(powerLevel, 10) as PowerLevel)
                : undefined;
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return { ...state, dataProfile: requestedDataProfile };
            }

            const dataProfile = packet.payload;
            if (dataProfile) {
                return {
                    ...state,
                    dataProfile: parseInt(dataProfile, 10) as PowerLevel,
                };
            }
        }
        return state;
    },
};
