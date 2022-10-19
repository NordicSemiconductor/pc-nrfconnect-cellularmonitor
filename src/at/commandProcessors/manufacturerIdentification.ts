/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

type ViewModel = {
    manufacturer?: string;
};

export const processor: Processor<ViewModel> = {
    command: '+CGMI',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgmi.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const manufacturer = packet.body.shift();
            return manufacturer ? { manufacturer } : {};
        }
        return {};
    },
};
