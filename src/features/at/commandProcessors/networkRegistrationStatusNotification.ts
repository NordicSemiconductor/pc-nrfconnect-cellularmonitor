/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { initialState, Processor } from '..';
import { RequestType } from '../parseAT';
import { getNumberArray, getParametersFromResponse } from '../utils';

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

export const processor: Processor<ViewModel> = {
    command: '+CEREG',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/cereg.html',
    initialState: () => ({}),
    onResponse: packet => {
        if (packet.status === 'OK' && packet.payload) {
            const responseArray = getParametersFromResponse(packet.payload);
            const networkRegistrationStatus: NetworkRegistrationStatus = {
                status: parseInt(responseArray[1], 10),
            };
            if (responseArray.length >= 4) {
                networkRegistrationStatus.tac = responseArray[2];
                networkRegistrationStatus.ci = responseArray[3];
                networkRegistrationStatus.AcT = parseInt(responseArray[4], 10);
            }
            if (responseArray.length >= 6) {
                const cause_type = responseArray[5]
                    ? responseArray[5]
                    : undefined;
                if (cause_type !== undefined) {
                    networkRegistrationStatus.cause_type = parseInt(
                        cause_type,
                        10
                    );
                }
                const reject_cause = responseArray[6]
                    ? responseArray[6]
                    : undefined;
                if (reject_cause !== undefined) {
                    networkRegistrationStatus.reject_cause = parseInt(
                        reject_cause,
                        10
                    );
                }
            }
            if (responseArray.length >= 9) {
                networkRegistrationStatus.activeTime = responseArray[7];
                networkRegistrationStatus.periodicTAU = responseArray[8];
            }
            return { networkRegistrationStatus };
        }

        return {};
    },
};
