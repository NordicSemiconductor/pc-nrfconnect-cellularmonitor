/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';

export type Reduction = {
    0: '0dB';
    1: 'Maximum power reduced by 0.5dB';
    2: 'Maximum power reduced by 1.0dB';
};

type Band = {
    band: number;
    reduction: keyof Reduction;
};
type Mode = keyof Reduction | Band[];

type ViewModel = {
    ltemTXReduction?: Mode;
    nbiotTXReduction?: Mode;
};

let requestedReduction: ViewModel | undefined = undefined;

export const processor: Processor<ViewModel> = {
    command: '%XEMPR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xempr.html',
    initialState: () => ({}),
    onRequest: packet => {
        if (packet.requestType === RequestType.SET_WITH_VALUE) {
            requestedReduction = parseToTXReduction(packet.payload);
        }
        return {};
    },
    onResponse: (packet, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET) {
                return {
                    nbiotTXReduction: undefined,
                    ltemTXReduction: undefined,
                };
            } else if (
                requestType === RequestType.SET_WITH_VALUE &&
                requestedReduction
            ) {
                return requestedReduction;
            } else if (requestType === RequestType.READ) {
                const firstSegmentLen = parseInt(packet.payload[2], 10);
                if (firstSegmentLen < (packet.payload.length - 2) * 2) {
                    const secondSegmentStart = 1 + firstSegmentLen * 2;
                    return {
                        ...parseToTXReduction(
                            packet.payload.slice(0, secondSegmentStart)
                        ),
                        ...parseToTXReduction(
                            packet.payload.slice(secondSegmentStart)
                        ),
                    };
                }
                return parseToTXReduction(packet.payload);
            }
        }
        return {};
    },
};

const parseToTXReduction = (values: string[]) => {
    let reductions: Mode;

    // Set all bands or set specific bands with individual values
    if (values[1] === '0') {
        reductions = parseInt(values[2], 10) as keyof Reduction;
    } else {
        reductions = [];
        for (let i = 2; i < values.length - 1; i += 2) {
            reductions.push({
                band: parseInt(values[i], 10),
                reduction: parseInt(values[i + 1], 10) as keyof Reduction,
            });
        }
    }

    // NB-IoT or LTE-M
    if (values[0] === '0') {
        return {
            nbiotTXReduction: reductions,
        };
    } else {
        return {
            ltemTXReduction: reductions,
        };
    }
};
