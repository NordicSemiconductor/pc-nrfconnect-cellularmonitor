/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber } from '../utils';

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
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/mob_termination_ctrl_status/xdataprfl.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (packet.payload) {
            const powerLevel = (Object.keys(PowerLevel) as string[]).find(
                key => key === packet.payload,
            );
            requestedDataProfile = powerLevel
                ? (getNumber(powerLevel) as PowerLevel)
                : undefined;
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return { ...state, dataProfile: requestedDataProfile };
            }

            if (packet.payload) {
                return {
                    ...state,
                    dataProfile: getNumber(packet.payload) as PowerLevel,
                };
            }
        }
        return state;
    },
};
