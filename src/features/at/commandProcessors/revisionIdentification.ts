/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

type ViewModel = {
    revisionID?: string;
};

export const processor: Processor<ViewModel> = {
    command: '+CGMR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgmr.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const revisionID = packet.payload.shift();
            return revisionID ? { revisionID } : {};
        }
        return {};
    },
};
