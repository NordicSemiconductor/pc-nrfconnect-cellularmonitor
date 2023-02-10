/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber, getNumberArray } from '../utils';

let setValue: boolean;

export const processor: Processor = {
    command: '%XCONNSTAT',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/xconnstat.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            const payloadValue = getNumber(packet.payload);
            if (payloadValue === 1) {
                setValue = true;
            }
            if (payloadValue === 0) {
                setValue = false;
            }
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return {
                    ...state,
                    connStat: { ...state.connStat, collecting: setValue },
                };
            }

            if (requestType === RequestType.READ && packet.payload) {
                const payloadValues = getNumberArray(packet.payload);
                const smsTX = payloadValues[0];
                const smsRX = payloadValues[1];
                const dataTX = payloadValues[2];
                const dataRX = payloadValues[3];
                const packetMax = payloadValues[4];
                const packetAverage = payloadValues[5];

                return {
                    ...state,
                    connStat: {
                        ...state.connStat,
                        smsTX,
                        smsRX,
                        dataTX,
                        dataRX,
                        packetMax,
                        packetAverage,
                    },
                };
            }
        }
        return state;
    },
};

export default processor;
