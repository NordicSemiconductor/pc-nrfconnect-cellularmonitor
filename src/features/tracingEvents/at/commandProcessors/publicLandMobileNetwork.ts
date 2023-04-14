/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    AcTState,
    AvailablePlmn,
    PlmnFormat,
    PlmnMode,
} from '../../types';
import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber, getParametersFromResponse } from '../utils';

let setPayload: Omit<PayloadParameters, 'AcTState'>;

export const processor: Processor<'+COPS'> = {
    command: '+COPS',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/cops.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (
            packet.requestType === RequestType.SET_WITH_VALUE &&
            packet.payload
        ) {
            setPayload = getParameters(packet.payload);
        }

        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                const { plmnMode, plmnFormat, plmn } = setPayload;
                return {
                    ...state,
                    plmnMode,
                    plmnFormat: plmnFormat ?? state.plmnFormat,
                    plmn: plmn ?? state.plmn,
                };
            }
            if (requestType === RequestType.READ && packet.payload) {
                const { plmnMode, plmnFormat, plmn, AcTState } = getParameters(
                    packet.payload
                );
                return {
                    ...state,
                    plmnMode,
                    plmnFormat: plmnFormat ?? state.plmnFormat,
                    plmn: plmn ?? state.plmn,
                    AcTState: AcTState ?? state.AcTState,
                };
            }
            if (requestType === RequestType.TEST) {
                if (packet.payload == null) {
                    // No available PLMNs
                    return {
                        ...state,
                        availablePlmns: [],
                    };
                }

                const availablePlmns = getAvailablePlmnsFromPayload(
                    packet.payload
                );

                return {
                    ...state,
                    availablePlmns,
                };
            }
        }
        return state;
    },
};

type PayloadParameters = {
    plmnMode: PlmnMode;
    plmnFormat?: PlmnFormat;
    plmn?: string;
    AcTState?: AcTState;
};

const getParameters = (payload: string): PayloadParameters => {
    const [plmnMode, plmnFormat, plmn, AcTState] =
        getParametersFromResponse(payload);
    return {
        plmnMode: getNumber(plmnMode) as PlmnMode,
        plmnFormat:
            plmnFormat != null
                ? (getNumber(plmnFormat) as PlmnFormat)
                : undefined,
        plmn: typeof plmn === 'string' ? plmn : undefined,
        AcTState:
            AcTState != null ? (getNumber(AcTState) as AcTState) : undefined,
    };
};

const getAvailablePlmnsFromPayload = (payload: string): AvailablePlmn[] => {
    const availablePlmns: AvailablePlmn[] = [];
    const matchContentInsideParenthesis = /(?<=\()[^)]*(?=\))/g;
    const matches = payload.matchAll(matchContentInsideParenthesis);

    Array.from(matches).forEach(match => {
        const [
            status,
            longOperatorName,
            shortOperatorName,
            operatorNumeric,
            AcTState,
        ] = getParametersFromResponse(match[0]);

        availablePlmns.push({
            stat: getNumber(status),
            longOperatorName,
            shortOperatorName,
            operatorNumeric,
            AcTState:
                AcTState != null
                    ? (getNumber(AcTState) as AcTState)
                    : undefined,
        });
    });

    return availablePlmns;
};
