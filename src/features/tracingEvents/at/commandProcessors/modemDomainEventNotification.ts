/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber } from '../utils';

const ModemDomainEvent = {
    ME_OVERHEATED: 'ME OVERHEATED',
    ME_BATTERY_LOW: 'ME BATTERY LOW',
    SEARCH_STATUS_1: 'SEARCH STATUS 1',
    SEARCH_STATUS_2: 'SEARCH STATUS 2',
    RESET_LOOP: 'RESET LOOP',
};

let setNotification: 0 | 1;

export const processor: Processor<'%MDMEV'> = {
    command: '%MDMEV',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/mob_termination_ctrl_status/mdmev.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            const payload = getNumber(packet.payload);
            if (payload === 0 || payload === 1) {
                setNotification = payload;
            }
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return {
                    ...state,
                    mdmevNotification: setNotification,
                };
            }
        }
        if (packet.payload) {
            const payload = packet.payload.trim();
            if (payload.includes(ModemDomainEvent.ME_OVERHEATED)) {
                state.meOverheated = true;
                return state;
            }
            if (payload.includes(ModemDomainEvent.ME_BATTERY_LOW)) {
                state.meBatteryLow = true;
                return state;
            }
            if (payload.includes(ModemDomainEvent.SEARCH_STATUS_1)) {
                state.searchStatus1 = true;
                return state;
            }
            if (payload.includes(ModemDomainEvent.SEARCH_STATUS_2)) {
                state.searchStatus2 = true;
                return state;
            }
            if (payload.includes(ModemDomainEvent.RESET_LOOP)) {
                state.resetLoop = true;
                return state;
            }
        }
        return state;
    },
};
