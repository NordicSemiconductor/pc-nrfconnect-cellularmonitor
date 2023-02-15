/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum TAU_TYPES {
    // T3412Extended
    SLEEP_INTERVAL = 0,
    // T3324
    ACTIVE_TIMER = 1,
}

export const TAU_DEFAULT_VALUE = 0;

export const TAU_SLEEP_INTERVAL_BASE_VALUES: { [index: string]: number } = {
    '000': 600,
    '001': 3600,
    '010': 36000,
    '011': 2,
    '100': 30,
    '101': 60,
};
export const TAU_ACTIVE_TIMER_BASE_VALUES: { [index: string]: number } = {
    '000': 2,
    '001': 60,
};

/*
 * Converts a 1byte/8bit string to number of seconds it represents
 * according to if it's
 * * T3412 extended timer ==> Periodic TAU
 * * T3324 timer ==> Active timer
 */
export const parseTAUByteToSeconds = (byteString: string, type: TAU_TYPES) => {
    const byteArray = [...byteString.trim()];

    if (byteArray.length !== 8) return TAU_DEFAULT_VALUE;

    const TAU_BASE_VALUE = byteArray.slice(0, 3).join('');
    const TAU_BINARY_VALUE = Number.parseInt(byteArray.slice(3).join(''), 2);

    if (
        type === TAU_TYPES.SLEEP_INTERVAL &&
        TAU_BASE_VALUE in TAU_SLEEP_INTERVAL_BASE_VALUES
    )
        return (
            TAU_SLEEP_INTERVAL_BASE_VALUES[TAU_BASE_VALUE] * TAU_BINARY_VALUE
        );

    if (
        type === TAU_TYPES.ACTIVE_TIMER &&
        TAU_BASE_VALUE in TAU_ACTIVE_TIMER_BASE_VALUES
    )
        return TAU_ACTIVE_TIMER_BASE_VALUES[TAU_BASE_VALUE] * TAU_BINARY_VALUE;

    return TAU_DEFAULT_VALUE;
};
