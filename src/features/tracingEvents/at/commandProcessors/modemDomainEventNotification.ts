/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber } from '../utils';

let setNotification: 0 | 1;

export const processor: Processor = {
    command: '%MDMEV',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/mdmev.html',
    initialState: () => ({}),
    onRequest: packet => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            const payload = getNumber(packet.payload);
            if (payload === 0 || payload === 1) {
                setNotification = payload;
            }
        }
        return {};
    },
    onResponse: (packet, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return {
                    mdmevNotification: setNotification,
                };
            }
        }
        return {};
    },
    onNotification: packet => {
        if (packet.payload) {
            return {
                modemDomainEvents: [packet.payload],
            };
        }
        return {};
    },
};
