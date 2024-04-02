/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { getStringNumberPair } from '../utils';

export const processor: Processor<'+CPINR'> = {
    command: '+CPINR',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/security/cpinr.html',
    initialState: () => ({ pinRetries: {} }),
    onResponse: (packet, state) => {
        if (packet.status === 'OK') {
            if (packet.payload) {
                const responseArray = getStringNumberPair(packet.payload);
                switch (responseArray[0]) {
                    case 'SIM PIN':
                        return {
                            ...state,
                            pinRetries: {
                                ...state.pinRetries,
                                SIM_PIN: responseArray[1],
                            },
                        };
                    case 'SIM PIN2':
                        return {
                            ...state,
                            pinRetries: {
                                ...state.pinRetries,
                                SIM_PIN2: responseArray[1],
                            },
                        };
                    case 'SIM PUK':
                        return {
                            ...state,
                            pinRetries: {
                                ...state.pinRetries,
                                SIM_PUK: responseArray[1],
                            },
                        };
                    case 'SIM PUK2':
                        return {
                            ...state,
                            pinRetries: {
                                ...state.pinRetries,
                                SIM_PUK2: responseArray[1],
                            },
                        };
                    default:
                }
            }
        }
        return state;
    },
};
