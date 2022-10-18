/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { getParametersFromResponse } from './utils';

type ViewModel = {
    imsi?: string;
};

export const processor: Processor<ViewModel> = {
    command: '+CIMI',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/access_uicc/cimi.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const imsi = getParametersFromResponse(packet.body)?.pop();
            return imsi ? { imsi } : {};
        }
        return {};
    },
};
