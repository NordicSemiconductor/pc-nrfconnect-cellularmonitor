/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { isValidAcTState } from '../../types';
import type { Processor } from '..';
import { getNumber, getParametersFromResponse } from '../utils';

export const processor: Processor<'+CEDRXRDP'> = {
    command: '+CEDRXRDP',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/cedrxrdp.html',
    initialState: () => ({}),
    onResponse: (packet, state) => {
        if (packet.status === 'OK' && packet.payload) {
            const payloadValues = getParametersFromResponse(packet.payload);

            /* eslint-disable camelcase */
            const AcTState = getNumber(payloadValues[0]);
            const requested_eDRX_value = validateEmptyString(payloadValues[1]);
            const NW_provided_eDRX_value = validateEmptyString(
                payloadValues[2]
            );
            const pagingTimeWindow = validateEmptyString(payloadValues[3]);

            return {
                ...state,
                AcTState: isValidAcTState(AcTState) ? AcTState : undefined,
                requested_eDRX_value,
                NW_provided_eDRX_value,
                pagingTimeWindow,
            };
        }
        return state;
    },
};

const validateEmptyString = (value: string) =>
    value === '' ? undefined : value;

export default processor;
