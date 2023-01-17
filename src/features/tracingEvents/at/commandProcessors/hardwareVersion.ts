/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

export const processor: Processor = {
    command: '%HWVERSION',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/hwver.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK' && packet.payload) {
            return { hardwareVersion: packet.payload };
        }
        return {};
    },
};
