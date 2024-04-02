/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { parseStringValue } from '../utils';

export const processor: Processor<'%XICCID'> = {
    command: '%XICCID',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/access_uicc/xiccid.html',
    initialState: () => ({}),
    onResponse: (packet, state) => {
        if (packet.status === 'OK') {
            return { ...state, iccid: parseStringValue(packet.payload ?? '') };
        }
        return state;
    },
};
