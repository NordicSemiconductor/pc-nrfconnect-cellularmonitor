/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';

type ViewModel = { pinState?: 'ready' | 'error' | 'unknown' };
export const processor: Processor<ViewModel> = {
    command: '+CFUN',
    documentation:
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fcfun.html&cp=2_1_4_0',
    initialState: () => ({ pinState: 'unknown' }),
    response(packet) {
        if (packet.status === 'OK') {
            return { pinState: 'ready' };
        }
        return { pinState: 'error' };
    },
};

export default processor;
