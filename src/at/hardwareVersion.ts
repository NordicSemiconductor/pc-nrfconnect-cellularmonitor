/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { getParametersFromResponse } from './utils';

type ViewModel = {
    hardwareVersion?: string;
};

export const processor: Processor<ViewModel> = {
    command: '%HWVERSION',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/hwver.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const hardwareVersion = packet.body.shift();
            return hardwareVersion ? { hardwareVersion } : {};
        }
        return {};
    },
};
