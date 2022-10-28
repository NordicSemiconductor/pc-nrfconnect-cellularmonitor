/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { getParametersFromResponse } from '../utils';

export const processor: Processor<ViewModel> = {
    command: '+CEREG',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/cereg.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK' && packet.payload) {
            return {
                networkRegistrationStatus: setNetworkRegistrationStatus(
                    'response',
                    packet.payload
                ),
            };
        }
        return {};
    },
    onNotification(packet) {
        if (packet.payload) {
            return {
                networkRegistrationStatus: setNetworkRegistrationStatus(
                    'notification',
                    packet.payload
                ),
            };
        }
        return {};
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

type NetworkRegistrationStatus = {
    status?: number;
    tac?: string;
    ci?: string;
    AcT?: number;
    cause_type?: number;
    reject_cause?: number;
    activeTime?: string;
    periodicTAU?: string;
};
type ViewModel = {
    networkRegistrationStatus?: NetworkRegistrationStatus;
};

type ResponseType = 'response' | 'notification';

const RESPONSE_INDEXES = {
    response: {
        status: 1,
        tac: 2,
        ci: 3,
        AcT: 4,
        cause_type: 5,
        reject_type: 6,
        activeTime: 7,
        periodicTAU: 8,
    },
    notification: {
        status: 0,
        tac: 1,
        ci: 2,
        AcT: 3,
        cause_type: 4,
        reject_type: 5,
        activeTime: 6,
        periodicTAU: 7,
    },
};

const setNetworkRegistrationStatus = (
    requestType: ResponseType,
    payload: string
): NetworkRegistrationStatus => {
    const index = RESPONSE_INDEXES[requestType];
    const responseArray = getParametersFromResponse(payload);
    const networkRegistrationStatus: NetworkRegistrationStatus = {
        status: parseInt(responseArray[index.status], 10),
    };
    if (responseArray.length >= 4) {
        networkRegistrationStatus.tac = responseArray[index.tac];
        networkRegistrationStatus.ci = responseArray[index.ci];
        networkRegistrationStatus.AcT = parseInt(responseArray[index.AcT], 10);
    }
    if (responseArray.length >= 6) {
        const causeType = responseArray[index.cause_type]
            ? responseArray[index.cause_type]
            : undefined;
        if (causeType !== undefined) {
            networkRegistrationStatus.cause_type = parseInt(causeType, 10);
        }
        const rejectCause = responseArray[index.reject_type]
            ? responseArray[index.reject_type]
            : undefined;
        if (rejectCause !== undefined) {
            networkRegistrationStatus.reject_cause = parseInt(rejectCause, 10);
        }
    }
    if (responseArray.length >= 9) {
        networkRegistrationStatus.activeTime = responseArray[index.activeTime];
        networkRegistrationStatus.periodicTAU =
            responseArray[index.periodicTAU];
    }
    return networkRegistrationStatus;
};
