/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '../..';
import { parseStringValue } from '../utils';

type ViewModel = {
    revisionID?: string;
};

export const processor: Processor<ViewModel> = {
    command: '+CGMR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgmr.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK' && packet.payload) {
            const revisionID = parseStringValue(packet.payload);
            return revisionID ? { revisionID } : {};
        }
        return {};
    },
};
