/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getParametersFromResponse } from '../utils';

let setPayload: {
    modemSupportLTEM: boolean;
    modemSupportNBIoT: boolean;
    modemSupportGNSS: boolean;
    modemSystemPreference: number;
};

export const processor: Processor<'%XSYSTEMMODE'> = {
    command: '%XSYSTEMMODE',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/mob_termination_ctrl_status/xsystemmode.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            setPayload = extractSystemModePayload(packet.payload);
        }

        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return { ...state, ...setPayload };
            }

            if (packet.payload) {
                return {
                    ...state,
                    ...extractSystemModePayload(packet.payload),
                };
            }
        }
        return state;
    },
};

const extractSystemModePayload = (packetPayload: string) => {
    const payload = getParametersFromResponse(packetPayload);

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
};
