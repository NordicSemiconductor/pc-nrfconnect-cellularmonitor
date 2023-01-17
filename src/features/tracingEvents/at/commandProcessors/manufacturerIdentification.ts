/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

export const processor: Processor = {
    command: '+CGMI',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgmi.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK') {
            return { manufacturer: packet.payload };
        }
        return {};
    },
};
