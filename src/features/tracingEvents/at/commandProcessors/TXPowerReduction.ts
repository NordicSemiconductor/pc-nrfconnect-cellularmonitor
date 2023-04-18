/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { State } from '../../types';
import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getLines, getNumberArray } from '../utils';

export type Reduction = {
    0: '0dB';
    1: 'Maximum power reduced by 0.5dB';
    2: 'Maximum power reduced by 1.0dB';
};

type Band = {
    band: number;
    reduction: keyof Reduction;
};
export type Mode = keyof Reduction | Band[];

type ViewModel = {
    ltemTXReduction?: Mode;
    nbiotTXReduction?: Mode;
};

let requestedReduction: ViewModel | undefined;

export const processor: Processor<'%XEMPR'> = {
    command: '%XEMPR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xempr.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            /*
             * There are two possible syntaxes for this command:
             * 1. payload: <system_mode>,0,<pr_for_all_bands>
             * 2. payload: <system_mode>,<k>,<pr_for_band_1>,<band_1>,<pr_for_band_2>,<band_2>,...
             * Where:
             * - <system_mode> is 0 for NB-IoT and 1 for LTE-M
             * - <k> is the number of bands for which the power reduction is set
             */
            const requestArgumentArray = getNumberArray(packet.payload);
            requestedReduction = parseToTXReduction(requestArgumentArray);
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET) {
                return {
                    ...state,
                    nbiotTXReduction: undefined,
                    ltemTXReduction: undefined,
                };
            }
            if (
                requestType === RequestType.SET_WITH_VALUE &&
                requestedReduction
            ) {
                return { ...state, ...requestedReduction };
            }
            if (requestType === RequestType.READ && packet.payload) {
                const modeLines = getLines(packet.payload);

                if (modeLines.length === 0) {
                    return state;
                }

                const result = modeLines.reduce<Partial<State>>(
                    (txPowerState, line) => {
                        const modeValues = getNumberArray(line);
                        return Object.assign(
                            txPowerState,
                            parseToTXReduction(modeValues)
                        );
                    },
                    {}
                );

                return { ...state, ...result };
            }
        }
        return state;
    },
};

const parseToTXReduction = (values: number[]) => {
    let reductions: Mode;

    // Set all bands or set specific bands with individual values
    if (values[1] === 0) {
        reductions = values[2] as keyof Reduction;
    } else {
        reductions = [];
        for (let i = 2; i < values.length - 1; i += 2) {
            reductions.push({
                band: values[i],
                reduction: values[i + 1] as keyof Reduction,
            });
        }
    }

    // NB-IoT or LTE-M
    if (values[0] === 0) {
        return {
            nbiotTXReduction: reductions,
        };
    }
    if (values[0] === 1) {
        return {
            ltemTXReduction: reductions,
        };
    }
    return {};
};
