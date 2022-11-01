/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { getStringNumberPair } from '../utils';

type ViewModel = {
    pinRetries: {
        SIM_PIN?: number;
        SIM_PIN2?: number;
        SIM_PUK?: number;
        SIM_PUK2?: number;
    };
};

export const processor: Processor<ViewModel> = {
    command: '+CPINR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/security/cpinr.html',
    initialState: () => ({ pinRetries: {} }),
    onResponse: packet => {
        if (packet.status === 'OK') {
            if (packet.payload) {
                const responseArray = getStringNumberPair(packet.payload);
                switch (responseArray[0]) {
                    case 'SIM PIN':
                        return {
                            pinRetries: {
                                SIM_PIN: responseArray[1],
                            },
                        };
                    case 'SIM PIN2':
                        return {
                            pinRetries: {
                                SIM_PIN2: responseArray[1],
                            },
                        };
                    case 'SIM PUK':
                        return {
                            pinRetries: {
                                SIM_PUK: responseArray[1],
                            },
                        };
                    case 'SIM PUK2':
                        return {
                            pinRetries: {
                                SIM_PUK2: responseArray[1],
                            },
                        };
                    default:
                }
            }
        }
        return {};
    },
};
