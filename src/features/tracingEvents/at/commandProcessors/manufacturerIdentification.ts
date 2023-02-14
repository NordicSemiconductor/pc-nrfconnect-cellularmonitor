/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { State } from '../../types';
import type { Processor } from '..';

export const processor: Processor<'+CGMI'> = {
    command: '+CGMI',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgmi.html',
    initialState: () => ({}),
    onResponse: (packet, state) => {
        if (packet.status === 'OK') {
            return { ...state, manufacturer: packet.payload } as State;
        }
        return state;
    },
};
