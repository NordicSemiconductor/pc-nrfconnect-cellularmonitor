/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumberArray } from '../utils';

const cause = {
    0: 'No specific cause (<cause> omitted)',
    1: 'PIN required',
    2: 'PIN2 required',
    3: 'PUK required (PIN blocked)',
    4: 'PUK2 required (PIN2 blocked)',
    5: 'PUK blocked',
    6: 'PUK2 blocked',
    7: 'Device personalization blocked',
    8: 'IMEI lock blocked',
    9: 'USIM card failure',
    10: 'USIM card changed',
    11: 'USIM profile changed',
};

export const processor: Processor<'%XSIM'> = {
    command: '%XSIM',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/access_uicc/xsim.html',
    initialState: () => ({}),
    onResponse: (packet, state, requestType) => {
        if (requestType === RequestType.READ && packet.payload) {
            const parsedValues = parsePayload(packet.payload);

            if (parsedValues) {
                return {
                    ...state,
                    ...parsedValues,
                };
            }
        }
        return state;
    },
    onNotification: (packet, state) => {
        if (packet.payload) {
            const parsedValues = parsePayload(packet.payload);

            if (parsedValues) {
                return {
                    ...state,
                    ...parsedValues,
                };
            }
        }
        return state;
    },
};

const parsePayload = (payload: string) => {
    const [uiccStatus, causeCode] = getNumberArray(payload);

    if (uiccStatus === 1) {
        return {
            uiccInitialised: true,
        };
    }
    if (uiccStatus === 0) {
        // Not initialised
        if (causeCode) {
            return {
                uiccInitialised: false,
                uiccInitialisedErrorCause:
                    cause[causeCode as keyof typeof cause],
                uiccInitialisedErrorCauseCode: causeCode,
            };
        }
        return {
            uiccInitialised: false,
        };
    }
};

export default processor;
