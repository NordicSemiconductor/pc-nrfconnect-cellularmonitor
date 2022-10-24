/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

type ViewModel = {
    modemUUID?: string;
};

export const processor: Processor<ViewModel> = {
    command: '%XMODEMUUID',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/modemuuid.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const modemUUID = packet.body.shift();
            return modemUUID ? { modemUUID } : {};
        }
        return {};
    },
};