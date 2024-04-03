/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber } from '../utils';

export const functionalMode = {
    POWER_OFF: 0,
    NORMAL_MODE: 1,
    FUNCTIONALITY_ONLY: 2,
    OFFLINE_MODE: 4,
    DEACTIVATE_LTE_KEEP_GNSS: 20,
    ACTIVATE_LTE_KEEP_GNSS: 21,
    DEACTIVATE_GNSS_KEEP_LTE: 30,
    ACTIVATE_GNSS_KEEP_LTE: 31,
    DEACTIVATE_UICC: 40,
    ACTIVATE_UICC: 41,
    OFFLINE_MODE_UICC: 44,
};

export type FunctionalMode =
    (typeof functionalMode)[keyof typeof functionalMode];

let requestedMode: FunctionalMode;

export const processor: Processor<'+CFUN'> = {
    command: '+CFUN',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/mob_termination_ctrl_status/cfun.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            requestedMode = getNumber(packet.payload);
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return { ...state, functionalMode: requestedMode };
            }

            if (requestType === RequestType.READ && packet.payload) {
                return {
                    ...state,
                    functionalMode: parseInt(
                        packet.payload,
                        10
                    ) as FunctionalMode,
                };
            }
        }
        return state;
    },
};

export default processor;
