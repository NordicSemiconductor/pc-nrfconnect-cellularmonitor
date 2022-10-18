/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { RequestType } from './parseAT';
import { getParametersFromResponse } from './utils';

export enum FunctionalModeSetter {
    POWER_OFF = 0,
    NORMAL_MODE = 1,
    FUNCTIONALITY_ONLY = 2,
    OFFLINE_MODE = 4,
    DEACTIVATE_LTE_KEEP_GNSS = 20,
    ACTIVATE_LTE_KEEP_GNSS = 21,
    DEACTIVATE_GNSS_KEEP_LTE = 30,
    ACTIVATE_GNSS_KEEP_LTE = 31,
    DEACTIVATE_UICC = 40,
    ACTIVATE_UICC = 41,
    OFFLINE_MODE_UICC = 44,
}

export const functionalMode = {
    0: 'Power off',
    1: 'Normal',
    4: 'Offline mode',
    44: 'Offline mode without shutting down UICC',
};

type FunctionalMode = keyof typeof functionalMode;
type ViewModel = {
    functionalMode?: FunctionalMode;
};

export const processor: Processor<ViewModel> = {
    command: '+CFUN',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/cfun.html',
    initialState: () => ({}),
    onResponse: (packet, requestType) => {
        if (packet.status === 'OK' && requestType === RequestType.READ) {
            const mode = getParametersFromResponse(packet.body)?.pop();
            return mode
                ? {
                      functionalMode: parseInt(mode, 10) as FunctionalMode,
                  }
                : {};
        }
        return {};
    },
};

export default processor;
