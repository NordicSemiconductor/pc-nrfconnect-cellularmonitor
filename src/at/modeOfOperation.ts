/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { RequestType } from './parseAT';
import { getParametersFromResponse } from './utils';

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
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fcemode.html&cp=2_1_4_11',
    initialState: () => ({}),
    request: (packet, requestType) => {
        if (requestType === RequestType.SET_WITH_VALUE && packet.body) {
            requestedModeOfOperation = parseInt(packet.body.trim(), 10);
        }
        return {};
    },
    response: (packet, requestType) => {
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

        if (packet.status === 'OK') {
            if (requestType === RequestType.READ) {
                const mode = getParametersFromResponse(packet.body)?.pop();
                return mode
                    ? {
                          modeOfOperation: parseInt(mode, 10),
                      }
                    : {};
            }
        }
        return {};
    },
};
