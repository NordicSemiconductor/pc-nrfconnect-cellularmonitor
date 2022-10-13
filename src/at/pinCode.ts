/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { getParametersFromResponse } from './utils';

const pinCodeStatus = {
    unknown: 'Not yet aware',
    READY: 'No PIN required',
    'SIM PUN': 'PIN code required',
    'SIM PIN': 'PUK code required',
    'SIM PUK': 'PIN2 code required',
    'SIM PIN2': 'PUK2 code required',
    'PH-SIM PIN': 'USIM depersonalization required',
    'PH-NET PIN': 'Network depersonalization required',
    'PH-NETSUB PIN': 'Network subset depersonalization required',
    'PH-SP PIN': 'Service provider depersonalization required',
    'PH-CORP PIN': 'Corporate depersonalization required',
};

type PinCodeStatus = keyof typeof pinCodeStatus;

type ViewModel = { pinCodeStatus: PinCodeStatus };

const tentativeState: Partial<ViewModel> | null = null;

export const processor: Processor<ViewModel> = {
    command: '+CPIN',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/security/cpin.html',
    initialState: () => ({ pinCodeStatus: 'unknown' }),
    response(packet) {
        if (packet.status === 'OK') {
            const responseArray = getParametersFromResponse(packet.body);

            const allowedStates = Object.keys(pinCodeStatus).filter(
                key => key !== 'unknown'
            ) as PinCodeStatus[];

            if (responseArray?.length === 1) {
                return {
                    pinCodeStatus:
                        allowedStates.find(
                            state => state === responseArray[0]
                        ) ?? 'unknown',
                };
            }
        }
        return { pinCodeStatus: 'unknown' };
    },
};

export default processor;
