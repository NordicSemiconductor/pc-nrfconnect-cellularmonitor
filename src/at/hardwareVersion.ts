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
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fcemode.html&cp=2_1_4_11',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const hardwareVersion = getParametersFromResponse(
                packet.body
            )?.pop();
            return hardwareVersion ? { hardwareVersion } : {};
        }
        return {};
    },
};
