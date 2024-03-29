/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

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

const ONE_MINUTE = 60;
const ONE_HOUR = ONE_MINUTE * 60;

export const PERIODIC_TAU_BASE_VALUES: { [index: string]: number } = {
    /*
     * Multiplyer of 000 means timer is Deactivated
     * And, a value of 0 effectively means that the timer is deactivated.
     */
    '000': ONE_MINUTE * 10,
    '001': ONE_HOUR,
    '010': ONE_HOUR * 10,
    '011': 2,
    '100': 30,
    '101': ONE_MINUTE,
    '110': ONE_HOUR * 320,
    '111': 0, // Deactivated
};
export const ACTIVE_TIMER_BASE_VALUES: { [index: string]: number } = {
    /*
     * Multiplyer of 000 means it's Deactivated
     * However, a value of 0 is allowed when activeTimer is activated.
     */
    '000': 2,
    '001': ONE_MINUTE,
    '010': ONE_MINUTE * 6, // 6 minutes
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
        TAU_MULTIPLYER in PERIODIC_TAU_BASE_VALUES
    )
        return PERIODIC_TAU_BASE_VALUES[TAU_MULTIPLYER] * TAU_BINARY_VALUE;

    if (
        type === TAU_TYPES.ACTIVE_TIMER &&
        TAU_MULTIPLYER in ACTIVE_TIMER_BASE_VALUES
    )
        return ACTIVE_TIMER_BASE_VALUES[TAU_MULTIPLYER] * TAU_BINARY_VALUE;

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

const eDRX = {
    '0000': 5.12,
    '0001': 10.24,
    '0010': 20.48,
    '0011': 40.96,
    '0100': 61.44,
    '0101': 81.92,
    '0110': 102.4,
    '0111': 122.88,
    '1000': 143.36,
    '1001': 163.84,
    '1010': 327.68,
    '1011': 655.36,
    '1101': 2621.44,
    '1110': 5242.88,
    '1111': 10485.76,
};

export const eDrxValueToSeconds = (bitmask: string): number =>
    eDRX[bitmask as keyof typeof eDRX] || -1;

type PagingTimeWindowlteM = typeof pagingTimeWindowLteM;
const pagingTimeWindowLteM = {
    '0000': 1.28,
    '0001': 2.56,
    '0010': 3.84,
    '0011': 5.12,
    '0100': 6.4,
    '0101': 7.68,
    '0110': 8.96,
    '0111': 10.24,
    '1000': 11.52,
    '1001': 12.8,
    '1010': 14.08,
    '1011': 15.36,
    '1100': 16.64,
    '1101': 17.92,
    '1110': 19.2,
    '1111': 20.48,
};

type PagingTimeWindowNbIot = typeof pagingTimeWindowNbIot;
const pagingTimeWindowNbIot = {
    '0000': 2.56,
    '0001': 5.12,
    '0010': 7.68,
    '0011': 10.24,
    '0100': 12.8,
    '0101': 15.36,
    '0110': 17.92,
    '0111': 20.48,
    '1000': 23.04,
    '1001': 25.6,
    '1010': 28.16,
    '1011': 30.72,
    '1100': 33.28,
    '1101': 35.84,
    '1110': 38.4,
    '1111': 40.96,
};

const eDRXType = {
    0: 'Off', // Current cell is not using eDRX. Used only in the unsolicited result code
    4: 'LTE-M',
    5: 'NB-IoT',
};

export const eDrxPagingTimeWindowToSeconds = (
    bitmask: string,
    AcT: keyof typeof eDRXType
): number => {
    const type = eDRXType[AcT];
    if (type === 'Off') {
        return -1;
    }
    if (type === 'LTE-M') {
        return (
            pagingTimeWindowLteM[bitmask as keyof PagingTimeWindowlteM] ?? -1
        );
    }
    if (type === 'NB-IoT') {
        return (
            pagingTimeWindowNbIot[bitmask as keyof PagingTimeWindowNbIot] ?? -1
        );
    }

    return -1 as never;
};
