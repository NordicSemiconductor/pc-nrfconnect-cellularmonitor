/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { RequestType } from './parseAT';
import { getParametersFromResponse } from './utils';

export const PowerLevel = {
    0: 'Ultra-low power',
    1: 'Low power',
    2: 'Normal',
    3: 'Performance',
    4: 'High performance',
};

type PowerLevel = keyof typeof PowerLevel;

type ViewModel = {
    dataProfile?: PowerLevel;
};

let requestedDataProfile: PowerLevel | undefined;

export const processor: Processor<ViewModel> = {
    command: '%XDATAPRFL',
    documentation:
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fcemode.html&cp=2_1_4_11',
    initialState: () => ({}),
    onRequest: packet => {
        const powerLevel = Object.keys(PowerLevel).find(
            key => key === packet.body
        );
        requestedDataProfile = powerLevel
            ? (parseInt(powerLevel, 10) as PowerLevel)
            : undefined;
        return {};
    },
    onResponse: (packet, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return { dataProfile: requestedDataProfile };
            }

            const dataProfile = getParametersFromResponse(packet.body)?.pop();
            return dataProfile
                ? { dataProfile: parseInt(dataProfile, 10) as PowerLevel }
                : {};
        }
        return {};
    },
};
