/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { RequestType } from './parseAT';
import { getParametersFromResponse } from './utils';

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
        'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fproc_cesq.html&cp=2_1_4_3',
    initialState: () => ({
        notifySignalQuality: false,
        signalQuality: {
            rsrp: 255,
            rsrp_threshold_index: 255,
            rsrq: 255,
            rsrq_threshold_index: 255,
        },
    }),
    request: packet => {
        if (packet.body?.startsWith('1')) {
            tentativeState = { notifySignalQuality: true };
            return {};
        }
        if (packet.body?.startsWith('0')) {
            tentativeState = { notifySignalQuality: false };
            return {};
        }
        return {};
    },
    response: (packet, requestType) => {
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
    notification: packet => {
        const signalQualityValues = getParametersFromResponse(packet.body)?.map(
            value => parseInt(value, 10)
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
