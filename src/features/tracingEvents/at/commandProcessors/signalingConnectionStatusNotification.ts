/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    RRCState,
    SignalingConnectionStatusNotifications,
} from '../../types';
import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getParametersFromResponse } from '../utils';

let setPayload: SignalingConnectionStatusNotifications;

export const processor: Processor<'+CSCON'> = {
    command: '+CSCON',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/packet_domain/cscon.html',
    initialState: () => ({}),

    onRequest: (packet, state) => {
        if (packet.requestType === RequestType.SET_WITH_VALUE) {
            const parsedPayload = Number.parseInt(
                getParametersFromResponse(packet.payload)[0],
                10
            );
            if (parsedPayload >= 0 && parsedPayload <= 4) {
                setPayload =
                    parsedPayload as SignalingConnectionStatusNotifications;
            }
        }
        return state;
    },

    onResponse: (packet, state, reqType) => {
        if (packet.status === 'OK') {
            if (reqType === RequestType.SET_WITH_VALUE) {
                return {
                    ...state,
                    signalingConnectionStatusNotifications: setPayload,
                };
            }

            if (reqType === RequestType.READ && packet.payload) {
                const rrcState = parseRRCState(packet.payload);
                return { ...state, rrcState };
            }
        }
        return state;
    },

    onNotification: (packet, state) => {
        if (packet.payload) {
            const rrcState = parseRRCState(packet.payload);
            return { ...state, rrcState };
        }
        return state;
    },
};

const parseRRCState = (payload: string) => {
    const parsedPayload = getParametersFromResponse(payload);
    const RRCState = Number.parseInt(parsedPayload[0], 10);

    return Number.isNaN(RRCState) ? undefined : (RRCState as RRCState);
};
