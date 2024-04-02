/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

export const processor: Processor<'%XMODEMUUID'> = {
    command: '%XMODEMUUID',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/general/modemuuid.html',
    initialState: () => ({}),
    onResponse: (packet, state) => {
        if (packet.status === 'OK') {
            return { ...state, modemUUID: packet.payload };
        }
        return state;
    },
};
