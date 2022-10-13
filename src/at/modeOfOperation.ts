/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';

const ModeOfOperation = {
    0: 'PS Mode 2',
    2: 'CS/PS mode 2',
};

type ViewModel = {
    modeOfOperation?: number;
};

const tentativeState = {
    requestedRead: false,
    requestedModeOfOperation: -1,
};

export const processor: Processor<ViewModel> = {
    command: '+CEMODE',
    documentation:
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fcemode.html&cp=2_1_4_11',
    initialState: () => ({}),
    request: packet => {
        if (packet?.operator === '?') {
            tentativeState.requestedRead = true;
        }
        if (packet.operator === '=' && packet.body) {
            tentativeState.requestedModeOfOperation = parseInt(
                packet.body.trim(),
                10
            );
        }
        return {};
    },
    response: packet => {
        if (packet.body?.startsWith('OK')) {
            if (tentativeState.requestedModeOfOperation !== -1) {
                const modeOfOperation = tentativeState.requestedModeOfOperation;
                tentativeState.requestedModeOfOperation = -1;
                return { modeOfOperation };
            }
            return {};
        }

        if (packet.status === 'OK') {
            if (tentativeState.requestedRead && packet.body) {
                tentativeState.requestedRead = false;
                return {
                    modeOfOperation: parseInt(packet.body, 10),
                };
            }
        }
        return {};
    },
};
