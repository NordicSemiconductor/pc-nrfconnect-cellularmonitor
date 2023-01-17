/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { getParametersFromResponse } from '../utils';

export const processor: Processor = {
    command: '%XSYSTEMMODE',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xsystemmode.html',
    initialState: () => ({}),
    onRequest: packet => {
        if (packet.status === 'OK') {
            const payload = getParametersFromResponse(packet.payload);

            // 1 = Supported, 0 = Not supported
            // Meaning that the check will be true if it's supported, else false.
            const modemSupportLTEM = payload[0] === '1';
            const modemSupportNBIoT = payload[1] === '1';
            const modemSupportGNSS = payload[2] === '1';
            const modemSystemPreference = Number.parseInt(payload[3], 10);

            return {
                modemSupportLTEM,
                modemSupportNBIoT,
                modemSupportGNSS,
                modemSystemPreference,
            };
        }

        return {};
    },
    onResponse: packet => {
        if (packet.status === 'OK' && packet.payload) {
            const payload = getParametersFromResponse(packet.payload);

            // 1 = Supported, 0 = Not supported
            // Meaning that the check will be true if it's supported, else false.
            const modemSupportLTEM = payload[0] === '1';
            const modemSupportNBIoT = payload[1] === '1';
            const modemSupportGNSS = payload[2] === '1';
            const modemSystemPreference = Number.parseInt(payload[3], 10);

            return {
                modemSupportLTEM,
                modemSupportNBIoT,
                modemSupportGNSS,
                modemSystemPreference,
            };
        }
        return {};
    },
};
