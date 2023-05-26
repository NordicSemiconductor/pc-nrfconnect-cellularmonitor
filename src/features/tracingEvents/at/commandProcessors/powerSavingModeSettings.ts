/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// The command can be given as +CPSMS= (with all parameters omitted). In this form, the parameter
// <mode> is set to 0, the use of PSM is disabled, and data for all parameters is set to the manufacturer-
// specific default values.

import {
    parsePowerSavingMode,
    TAU_TYPES,
} from '../../../../utils/powerSavingMode';
import { PowerSavingModeEntries } from '../../types';
import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getParametersFromResponse } from '../utils';

const defaultT3324 = parsePowerSavingMode('00100001', TAU_TYPES.ACTIVE_TIMER);
const defaultT3412Extended = parsePowerSavingMode(
    '00000110',
    TAU_TYPES.SLEEP_INTERVAL
);

const resetToDefault = {
    state: 'off',
    T3324: defaultT3324,
    T3412Extended: defaultT3412Extended,
} as PowerSavingModeEntries;

let setRequested: PowerSavingModeEntries;

export const processor: Processor<'+CPSMS'> = {
    command: '+CPSMS',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/cpsms.html',
    initialState: () => ({
        powerSavingMode: {},
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
        if (packet.requestType === RequestType.SET) {
            setRequested = resetToDefault;
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (
                requestType === RequestType.SET_WITH_VALUE ||
                requestType === RequestType.SET
            ) {
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
    const [mode, , , T3412ExtendedBitmask, T3324Bitmask] =
        getParametersFromResponse(payload);

    const result = {
        state: mode === '1' ? 'on' : 'off',
    } as PowerSavingModeEntries;

    result.T3324 =
        T3324Bitmask !== undefined
            ? parsePowerSavingMode(T3324Bitmask, TAU_TYPES.ACTIVE_TIMER)
            : defaultT3324;
    result.T3412Extended =
        T3412ExtendedBitmask !== undefined
            ? parsePowerSavingMode(
                  T3412ExtendedBitmask,
                  TAU_TYPES.SLEEP_INTERVAL
              )
            : defaultT3412Extended;

    return result;
};
