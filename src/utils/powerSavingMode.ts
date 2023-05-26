/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from 'pc-nrfconnect-shared';

import {
    isValidBitmask,
    PowerSavingModeDeactivatedTimer,
    PowerSavingModeValues,
} from '../features/tracingEvents/types';

export enum TAU_TYPES {
    // T3412Extended
    SLEEP_INTERVAL = 0,
    // T3324
    ACTIVE_TIMER = 1,
}

export const TAU_SLEEP_INTERVAL_BASE_VALUES: { [index: string]: number } = {
    /*
     * Multiplyer of 000 means timer is Deactivated
     * And, a value of 0 effectively means that the timer is deactivated.
     */
    '000': 600,
    '001': 3600,
    '010': 36000,
    '011': 2,
    '100': 30,
    '101': 60,
    '111': 0, // Deactivated
};
export const TAU_ACTIVE_TIMER_BASE_VALUES: { [index: string]: number } = {
    /*
     * Multiplyer of 000 means it's Deactivated
     * However, a value of 0 is allowed when activeTimer is activated.
     */
    '000': 2,
    '001': 60,
    '111': 0, // Deactivated
};

/*
 * Converts a 1byte/8bit string to number of seconds it represents
 * according to if it's
 * * T3412 extended timer ==> Periodic TAU
 * * T3324 timer ==> Active timer
 */
export const parseTAUByteToSeconds = (byteString: string, type: TAU_TYPES) => {
    const byteArray = Array.from(byteString);

    if (byteArray.length !== 8) {
        logger.debug(
            `parseTAUByteToSeconds: Invalid byte string, byte mask is not 8 bits. Length: ${byteArray.length}. Byte string: ${byteString}`
        );
        return -1;
    }

    const TAU_MULTIPLYER = byteArray.slice(0, 3).join('');
    if (TAU_MULTIPLYER === '111') {
        // This means that the timer is deactivated
        return -1;
    }

    const TAU_BINARY_VALUE = Number.parseInt(byteArray.slice(3).join(''), 2);

    if (
        type === TAU_TYPES.SLEEP_INTERVAL &&
        TAU_MULTIPLYER in TAU_SLEEP_INTERVAL_BASE_VALUES
    )
        return (
            TAU_SLEEP_INTERVAL_BASE_VALUES[TAU_MULTIPLYER] * TAU_BINARY_VALUE
        );

    if (
        type === TAU_TYPES.ACTIVE_TIMER &&
        TAU_MULTIPLYER in TAU_ACTIVE_TIMER_BASE_VALUES
    )
        return TAU_ACTIVE_TIMER_BASE_VALUES[TAU_MULTIPLYER] * TAU_BINARY_VALUE;

    // Invalid values: deactivated timer returned
    logger.debug(
        `parseTauByteToSeconds: Invalid value. Type: ${type}. Byte string: ${byteString}`
    );
    return -1 as never;
};

export const parsePowerSavingMode = (
    bitmask: string,
    type: TAU_TYPES
): PowerSavingModeValues => {
    if (isValidBitmask(bitmask)) {
        const seconds = parseTAUByteToSeconds(bitmask, type);
        if (seconds === -1) {
            // means timer is deactivated
            return PowerSavingModeDeactivatedTimer;
        }

        return {
            activated: true,
            bitmask,
            value: seconds,
            unit: 'seconds',
        };
    }

    return PowerSavingModeDeactivatedTimer;
};

export function isDeactivated(bitmask: string): boolean {
    return bitmask.slice(0, 3) === '111';
}
