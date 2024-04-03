/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { eDRX, State } from '../../types';
import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getLines, getNumber, getParametersFromResponse } from '../utils';

interface SetPayload {
    mode?: 0 | 1 | 2 | 3;
    AcT?: 0 | 4 | 5;
    requested?: string;
}
const setPayload: SetPayload = {};

export const processor: Processor<'+CEDRXS'> = {
    command: '+CEDRXS',
    documentation:
        'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/nw_service/cedrxs.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            const payload = getParametersFromResponse(packet.payload);
            if (payload[0]) {
                setPayload.mode = getNumber(payload[0]) as 0 | 1 | 2 | 3;
            }
            if (payload[1]) {
                setPayload.AcT = getNumber(payload[1]) as 0 | 4 | 5;
            }
            if (payload[2]) {
                setPayload.requested = payload[2];
            }
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                if (setPayload?.AcT === 4) {
                    return {
                        ...state,
                        eDrxLteM: {
                            requestedValue: setPayload.requested,
                        },
                    };
                }
                if (setPayload?.AcT === 5) {
                    return {
                        ...state,
                        eDrxNbIot: {
                            requestedValue: setPayload.requested,
                        },
                    };
                }
                return state;
            }

            if (requestType === RequestType.READ && packet.payload) {
                if (packet.payload) {
                    const update = parseEdrxPayloadLines(packet.payload, state);
                    return {
                        ...state,
                        ...update,
                    };
                }
            }
        }
        return state;
    },

    onNotification: (packet, state) => {
        if (packet.payload) {
            const update = parseEdrxPayloadLines(packet.payload, state);
            return {
                ...state,
                ...update,
            };
        }

        return state;
    },
};

export const parseEdrxPayloadLines = (payload: string, state: State) => {
    const lines = getLines(payload);

    const result = {
        eDrxLteM: {} as eDRX,
        eDrxNbIot: {} as eDRX,
    };

    lines.forEach(line => {
        line = line.replace(/\+CEDRXS:\|+CEDRXRDP:/, '').trim();
        const values = getParametersFromResponse(line);

        const AcT = getNumber(values[0]);
        if (AcT === 0) {
            result.eDrxLteM = {
                AcT: 0,
            };
            result.eDrxNbIot = {
                AcT: 0,
            };
        } else if (AcT === 4) {
            result.eDrxLteM = {
                requestedValue:
                    values[1] != null
                        ? values[1]
                        : state.eDrxLteM.requestedValue,
                nwProvidedValue:
                    values[2] != null
                        ? values[2]
                        : state.eDrxLteM.nwProvidedValue,
                pagingTimeWindow:
                    values[3] != null
                        ? values[3]
                        : state.eDrxLteM.pagingTimeWindow,
            };
        } else if (AcT === 5) {
            result.eDrxNbIot = {
                requestedValue:
                    values[1] != null
                        ? values[1]
                        : state.eDrxNbIot.requestedValue,
                nwProvidedValue:
                    values[2] != null
                        ? values[2]
                        : state.eDrxNbIot.nwProvidedValue,
                pagingTimeWindow:
                    values[3] != null
                        ? values[3]
                        : state.eDrxNbIot.pagingTimeWindow,
            };
        }
    });

    return result;
};
