/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    parseTAUByteToSeconds,
    TAU_TYPES,
} from '../../../../utils/powerSavingMode';
import {
    isValidAcTState,
    isValidBitmask,
    NetworkStatusNotifications,
    PowerSavingModeEntries,
    State,
} from '../../types';
import type { Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumber, getParametersFromResponse } from '../utils';

let setPayload: NetworkStatusNotifications;

export const processor: Processor<'+CEREG'> = {
    command: '+CEREG',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/cereg.html',
    initialState: () => ({}),
    onRequest: (packet, state) => {
        if (packet.requestType === RequestType.SET_WITH_VALUE) {
            const payload = getParametersFromResponse(packet.payload);
            if (payload) {
                setPayload = Number.parseInt(
                    payload[0],
                    10
                ) as NetworkStatusNotifications;
            }
        }
        return state;
    },
    onResponse: (packet, state, requestType) => {
        if (packet.status === 'OK') {
            if (requestType === RequestType.SET_WITH_VALUE) {
                return { ...state, networkStatusNotifications: setPayload };
            }

            if (packet.payload !== undefined) {
                return handleNetworkRegPayload(
                    'response',
                    packet.payload,
                    state
                );
            }
        }
        return state;
    },
    onNotification: (packet, state) => {
        if (packet.payload) {
            if (packet.payload !== undefined) {
                return handleNetworkRegPayload(
                    'notification',
                    packet.payload,
                    state
                );
            }
        }
        return state;
    },
};

export const networkStatus = {
    0: {
        short: 'Not Registered',
        long: 'Not registered. User Equipment (UE) is not currently searching for an operator to register to.',
    },
    1: { short: 'Registered', long: 'Registered, home network' },
    2: {
        short: 'Not Registered',
        long: 'Not registered, but UE is currently trying to attach or searching an operator to register to',
    },
    3: { short: 'Denied', long: 'Registration denied' },
    // TODO: 'Unknown' is also the default in the frontend view.
    4: {
        short: 'Unknown',
        long: 'Unknown (for example, out of Evolved Terrestrial Radio Access Network (E-UTRAN) coverage)',
    },
    5: { short: 'Registered', long: 'Registered, roaming' },
    90: {
        short: 'Not Registered',
        long: 'Not registered due to Universal Integrated Circuit Card (UICC) failure',
    },
} as const;

type NetworkStatuses = typeof networkStatus;
export type NetworkStatus = NetworkStatuses[keyof NetworkStatuses];

type NetworkRegistrationStatus = Required<Pick<State, 'networkStatus'>> &
    Partial<
        Pick<
            State,
            | 'tac'
            | 'ci'
            | 'AcTState'
            | 'ceregCauseType'
            | 'ceregRejectCause'
            | 'powerSavingMode'
        >
    >;

type ResponseType = 'response' | 'notification';

const RESPONSE_INDEXES = {
    response: {
        networkStatus: 1,
        tac: 2,
        ci: 3,
        AcT: 4,
        cause_type: 5,
        reject_type: 6,
        T3324: 7,
        T3412Extended: 8,
    },
    notification: {
        networkStatus: 0,
        tac: 1,
        ci: 2,
        AcT: 3,
        cause_type: 4,
        reject_type: 5,
        T3324: 6,
        T3412Extended: 7,
    },
};

const handleNetworkRegPayload = (
    requestType: ResponseType,
    payload: string,
    state: State
): State => {
    const index = RESPONSE_INDEXES[requestType];
    const responseArray = getParametersFromResponse(payload);
    const networkRegState: NetworkRegistrationStatus = {
        networkStatus: getNumber(responseArray[index.networkStatus]),
    };
    if (responseArray.length >= 4) {
        networkRegState.tac = responseArray[index.tac];
        networkRegState.ci = responseArray[index.ci];
        const AcTState = getNumber(responseArray[index.AcT]);
        networkRegState.AcTState = isValidAcTState(AcTState)
            ? AcTState
            : undefined;
    }
    if (responseArray.length >= 6) {
        const causeType = responseArray[index.cause_type]
            ? responseArray[index.cause_type]
            : undefined;
        if (causeType !== undefined) {
            networkRegState.ceregCauseType = parseInt(causeType, 10);
        }
        const rejectCause = responseArray[index.reject_type]
            ? responseArray[index.reject_type]
            : undefined;
        if (rejectCause !== undefined) {
            networkRegState.ceregRejectCause = parseInt(rejectCause, 10);
        }
    }
    let grantedPSM: PowerSavingModeEntries | undefined;
    if (responseArray.length >= 9) {
        grantedPSM = { state: 'on' };
        const T3324Bitmask = responseArray[index.T3324];
        if (isValidBitmask(T3324Bitmask)) {
            grantedPSM.T3324 = {
                bitmask: T3324Bitmask,
                value: parseTAUByteToSeconds(
                    T3324Bitmask,
                    TAU_TYPES.ACTIVE_TIMER
                ),
                unit: 'seconds',
            };
        }

        const T3412ExtendedBitmask = responseArray[index.T3412Extended];
        if (isValidBitmask(T3412ExtendedBitmask)) {
            grantedPSM.T3412Extended = {
                bitmask: T3412ExtendedBitmask,
                value: parseTAUByteToSeconds(
                    T3412ExtendedBitmask,
                    TAU_TYPES.SLEEP_INTERVAL
                ),
                unit: 'seconds',
            };
        }
    }
    return {
        ...state,
        ...networkRegState,
        powerSavingMode: {
            requested: { ...state?.powerSavingMode?.requested },
            granted: grantedPSM ?? { ...state.powerSavingMode?.granted },
        },
    };
};
