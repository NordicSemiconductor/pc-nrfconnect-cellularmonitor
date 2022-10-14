/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { getParametersFromResponse } from './utils';

type ViewModel = {
    manufacturer?: string;
};

export const processor: Processor<ViewModel> = {
    command: '%XICCID',
    documentation:
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fcemode.html&cp=2_1_4_11',
    initialState: () => ({}),
    response: packet => {
        if (packet.status === 'OK') {
            const manufacturer = getParametersFromResponse(packet.body)?.pop();
            return manufacturer ? { manufacturer } : {};
        }
        return {};
    },
};
