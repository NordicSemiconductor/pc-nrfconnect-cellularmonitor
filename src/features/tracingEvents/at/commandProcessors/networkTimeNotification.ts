/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber, getParametersFromResponse } from '../utils';

let setValue: 0 | 1;

export const processor: Processor<'%XTIME'> = {
    command: '%XTIME',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/nw_service/xtime.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (packet.requestType === RequestType.SET_WITH_VALUE) {
            const payloadValue = getNumber(packet.payload ?? '');
            if (payloadValue === 1 || payloadValue === 0) {
                setValue = payloadValue;
            }
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (
            packet.status === 'OK' &&
            requestType === RequestType.SET_WITH_VALUE
        ) {
            return { ...state, networkTimeNotifications: setValue };
        }
        return state;
    },
    onNotification: (packet, state) => {
        const payloadValues = getParametersFromResponse(packet.payload);

        return {
            ...state,
            networkTimeNotification: {
                localTimeZone:
                    payloadValues[0] !== '' ? payloadValues[0] : undefined,
                universalTime:
                    payloadValues[1] !== '' ? payloadValues[1] : undefined,
                daylightSavingTime:
                    payloadValues[2] !== '' ? payloadValues[2] : undefined,
            },
        };
    },
};

export default processor;
