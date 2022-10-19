/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';

type ViewModel = {
    notifySignalQuality?: boolean;
    signalQuality: {
        rsrp: number;
        rsrp_threshold_index: number;
        rsrq: number;
        rsrq_threshold_index: number;
    };
};

let tentativeState: Partial<ViewModel> | null = null;

export const processor: Processor<ViewModel> = {
    command: '%CESQ',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/proc_cesq.html',
    initialState: () => ({
        notifySignalQuality: false,
        signalQuality: {
            rsrp: 255,
            rsrp_threshold_index: 255,
            rsrq: 255,
            rsrq_threshold_index: 255,
        },
    }),
    onRequest: packet => {
        if (packet.body.length !== 1) {
            return {};
        }
        if (packet.body[0].startsWith('1')) {
            tentativeState = { notifySignalQuality: true };
            return {};
        }
        if (packet.body[0].startsWith('0')) {
            tentativeState = { notifySignalQuality: false };
            return {};
        }
        return {};
    },
    onResponse: (packet, requestType) => {
        if (
            packet.status === 'OK' &&
            requestType === RequestType.SET_WITH_VALUE
        ) {
            if (tentativeState != null) {
                return tentativeState;
            }
        }
        return {};
    },
    onNotification: packet => {
        const signalQualityValues = packet.body.map(value =>
            parseInt(value, 10)
        );

        if (signalQualityValues?.length === 4) {
            return {
                signalQuality: {
                    rsrp: signalQualityValues[0],
                    rsrp_threshold_index: signalQualityValues[1],
                    rsrq: signalQualityValues[2],
                    rsrq_threshold_index: signalQualityValues[3],
                },
            };
        }
        return {};
    },
};
