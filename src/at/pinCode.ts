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

const evaluatePinStateResponse = (
    responseArray: string[] | undefined
): PinCodeStatus => {
    const allowedStates = [
        'READY',
        'SIM PUN',
        'SIM PIN',
        'SIM PUK',
        'SIM PIN2',
        'PH-SIM PIN',
        'PH-NET PIN',
        'PH-NETSUB PIN',
        'PH-SP PIN',
        'PH-CORP PIN',
    ] as PinCodeStatus[];

    // Typescript challange: Improve the type narrowing
    if (responseArray) {
        let returnValue: PinCodeStatus | null = null;
        allowedStates.forEach((response, index) => {
            if (response === responseArray[0]) {
                returnValue = allowedStates[index];
            }
        });
        if (returnValue) {
            return returnValue;
        }
    }
    return 'unknown';
};

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
            return {
                pinCodeStatus: evaluatePinStateResponse(responseArray),
            };
        }
        return { pinCodeStatus: 'unknown' };
    },
};

export default processor;
