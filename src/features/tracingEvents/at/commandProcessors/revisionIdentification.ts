/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { parseStringValue } from '../utils';

export const processor: Processor = {
    command: '+CGMR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgmr.html',
    initialState: () => ({}),
    onResponse: ( packet, state ) => {
        if (packet.status === 'OK' && packet.payload) {
            const revisionID = parseStringValue(packet.payload);
            return { ...state, revisionID };
        }
        return state;
    },
};
