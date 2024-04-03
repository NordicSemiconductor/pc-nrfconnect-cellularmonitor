/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { parseStringValue } from '../utils';

export const processor: Processor<'+CGMR'> = {
    command: '+CGMR',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/general/cgmr.html',
    initialState: () => ({}),
    onResponse: (packet, state) => {
        if (packet.status === 'OK' && packet.payload) {
            const revisionID = parseStringValue(packet.payload);
            return { ...state, revisionID };
        }
        return state;
    },
};
