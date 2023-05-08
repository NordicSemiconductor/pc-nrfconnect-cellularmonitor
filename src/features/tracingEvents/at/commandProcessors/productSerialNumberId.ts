/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { parseStringValue } from '../utils';

export const processor: Processor<'+CGSN'> = {
    command: '+CGSN',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/general/cgsn.html',
    initialState: () => ({}),
    onResponse: (packet, state, requestType) => {
        if (
            (requestType === RequestType.SET ||
                requestType === RequestType.SET_WITH_VALUE) &&
            packet.payload
        ) {
            const IMEI = parseStringValue(packet.payload);
            if (IMEI != null) {
                return { ...state, IMEI: IMEI ?? undefined };
            }
        }

        return state;
    },
};
