/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// The command can be given as +CPSMS= (with all parameters omitted). In this form, the parameter
// <mode> is set to 0, the use of PSM is disabled, and data for all parameters is set to the manufacturer-
// specific default values.

import {
    isValidBitmask,
    PowerSavingModeEntries,
    PowerSavingModeValues,
} from '../../types';
import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getParametersFromResponse } from '../utils';

const defaultT3324 = {
    bitmask: '00100001',
    value: 60,
    unit: 'minutes',
} as PowerSavingModeValues;
const defaultT3412Extended = {
    bitmask: '00000110',
    value: 1,
    unit: 'minutes',
} as PowerSavingModeValues;

const resetToDefault = {
    state: 'off',
    T3324: defaultT3324,
    T3412Extended: defaultT3412Extended,
} as PowerSavingModeEntries;

let setRequested: PowerSavingModeEntries;

export const processor: Processor = {
    command: '+CPSMS',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/cpsms.html',
    initialState: () => ({
        powerSavingMode: {
            requested: {
                T3324: defaultT3324,
                T3412Extended: defaultT3412Extended,
            },
        },
    }),
    onRequest: (packet, state) => {
        if (packet.requestType === RequestType.SET_WITH_VALUE) {
            if (packet.payload) {
                setRequested = parsePowerSavingModePayload(packet.payload);
            } else {
                // Then we must have gotten the `AT+CPSMS=` command
                // Which means we should turn PSM off and reset timers to default.
                setRequested = resetToDefault;
            }
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return {
                    ...state,
                    powerSavingMode: {
                        requested: {
                            ...state.powerSavingMode?.requested,
                            ...setRequested,
                        },
                        granted: state.powerSavingMode?.granted,
                    },
                };
            }

            if (requestType === RequestType.READ && packet.payload) {
                return {
                    ...state,
                    powerSavingMode: {
                        requested: {
                            ...state.powerSavingMode?.requested,
                            ...parsePowerSavingModePayload(packet.payload),
                        },
                        granted: state.powerSavingMode?.granted,
                    },
                };
            }
        }
        return state;
    },
};

const parsePowerSavingModePayload = (payload: string) => {
    const [
        mode,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _ignored,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _ignored2,
        T3412ExtendedBitmask,
        T3324Bitmask,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ..._rest
    ] = getParametersFromResponse(payload);

    let result = {
        state: mode === '1' ? 'on' : 'off',
    } as PowerSavingModeEntries;

    if (isValidBitmask(T3412ExtendedBitmask)) {
        result = {
            ...result,
            T3412Extended: { bitmask: T3412ExtendedBitmask },
        };
    }

    if (isValidBitmask(T3324Bitmask)) {
        result = { ...result, T3324: { bitmask: T3324Bitmask } };
    }

    return result;
};
