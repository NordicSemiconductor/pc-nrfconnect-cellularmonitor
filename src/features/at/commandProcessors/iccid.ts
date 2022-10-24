/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

type ViewModel = {
    iccid?: string;
};

export const processor: Processor<ViewModel> = {
    command: '%XICCID',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/access_uicc/xiccid.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const iccid = packet.body.shift();
            return iccid ? { iccid } : {};
        }
        return {};
    },
};