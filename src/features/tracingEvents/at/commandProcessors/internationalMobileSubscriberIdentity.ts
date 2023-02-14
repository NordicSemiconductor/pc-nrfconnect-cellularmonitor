/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

export const processor: Processor<'+CIMI'> = {
    command: '+CIMI',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/access_uicc/cimi.html',
    initialState: () => ({}),
    onResponse: (packet, state) => {
        if (packet.status === 'OK') {
            return { ...state, imsi: packet.payload };
        }
        return state;
    },
};
