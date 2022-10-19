/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { RequestType } from './parseAT';

type ViewModel = {
    IMEI?: string;
};

export const processor: Processor<ViewModel> = {
    command: '+CGSN',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgsn.html',
    initialState: () => ({}),
    onResponse: (packet, requestType) => {
        if (requestType === RequestType.SET_WITH_VALUE) {
            const IMEI = packet.body.shift();
            if (IMEI != null) {
                return { IMEI: IMEI ?? undefined };
            }
        }

        return {};
    },
};
