/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { getParametersFromResponse, RequestType } from './utils';

type ViewModel = {
    availableBands?: number[];
    currentBand?: number;
};

export const processor: Processor<ViewModel> = {
    command: '%XCBAND',
    initialState: () => ({}),
    documentation:
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fxcband.html&cp=2_1_4_9',
    response: (packet, requestType) => {
        if (packet.status === 'OK' && packet.body) {
            if (requestType === RequestType.TEST) {
                // Response to a test command, e.g. %XCBAND: (1,2,3,4,5)
                const availableBands = /\(([\d,]+)\)/g
                    .exec(packet.body)
                    ?.slice(1)[0]
                    ?.split(',')
                    .map(band => parseInt(band, 10));

                return { availableBands };
            }
            const currentBand = getParametersFromResponse(packet.body)?.pop();

            // Response to a set command e.g. %XCBAND: 13
            return currentBand
                ? { currentBand: parseInt(currentBand, 10) }
                : {};
        }
        return {};
    },
};
