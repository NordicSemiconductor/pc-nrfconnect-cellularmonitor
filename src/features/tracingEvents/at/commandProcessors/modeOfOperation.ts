/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '../..';
import { RequestType } from '../parseAT';
import { getNumber } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ModeOfOperation = {
    0: 'PS Mode 2',
    2: 'CS/PS mode 2',
};

type ViewModel = {
    modeOfOperation?: number;
};

let requestedModeOfOperation = -1;

export const processor: Processor<ViewModel> = {
    command: '+CEMODE',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/cemode.html',
    initialState: () => ({}),
    onRequest: packet => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            requestedModeOfOperation = getNumber(packet.payload);
        }
        return {};
    },
    onResponse: (packet, requestType) => {
        if (
            packet.status === 'OK' &&
            requestType === RequestType.SET_WITH_VALUE
        ) {
            if (requestedModeOfOperation !== -1) {
                const modeOfOperation = requestedModeOfOperation;
                requestedModeOfOperation = -1;
                return { modeOfOperation };
            }
            return {};
        }

        if (packet.status === 'OK' && packet.payload) {
            if (requestType === RequestType.READ) {
                return { modeOfOperation: parseInt(packet.payload, 10) };
            }
        }
        return {};
    },
};
