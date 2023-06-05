/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { parseEdrxPayloadLines } from './eDrxSetting';

export const processor: Processor<'+CEDRXRDP'> = {
    command: '+CEDRXRDP',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/cedrxrdp.html',
    initialState: () => ({}),
    onResponse: (packet, state) => {
        if (packet.status === 'OK' && packet.payload) {
            const update = parseEdrxPayloadLines(packet.payload, state);
            return {
                ...state,
                ...update,
            };
        }
        return state;
    },
};
