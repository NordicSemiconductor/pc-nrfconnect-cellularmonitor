/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumberArray } from '../utils';

type ViewModel = {
    notifySignalQuality?: boolean;
    signalQuality: {
        rsrp: number;
        rsrp_threshold_index: number;
        rsrp_decibel: number;
        rsrq: number;
        rsrq_threshold_index: number;
        rsrq_decibel: number;
    };
};

let tentativeState: Partial<ViewModel> | null = null;

export const processor: Processor<'%CESQ'> = {
    command: '%CESQ',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/mob_termination_ctrl_status/proc_cesq.html',
    initialState: () => ({
        notifySignalQuality: false,
        signalQuality: {},
    }),
    onRequest: (packet, state) => {
        if (packet.payload) {
            if (packet.payload.startsWith('1')) {
                tentativeState = { notifySignalQuality: true };
            }
            if (packet.payload.startsWith('0')) {
                tentativeState = { notifySignalQuality: false };
            }
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (
            packet.status === 'OK' &&
            requestType === RequestType.SET_WITH_VALUE
        ) {
            if (tentativeState != null) {
                return { ...state, ...tentativeState };
            }
        }
        return state;
    },
    onNotification: (packet, state) => {
        if (packet.payload) {
            const [rsrp, rsrpThresholdIndex, rsrq, rsrqThresholdIndex] =
                getNumberArray(packet.payload);

            return {
                ...state,
                signalQuality: {
                    ...state.signalQuality,
                    rsrp,
                    rsrp_threshold_index: rsrpThresholdIndex,
                    rsrp_decibel: rsrp !== 255 ? rsrp - 140 : undefined,

                    rsrq,
                    rsrq_threshold_index: rsrqThresholdIndex,
                    rsrq_decibel: rsrq !== 255 ? rsrq / 2 - 19.5 : undefined,
                },
            };
        }
        return state;
    },
};
