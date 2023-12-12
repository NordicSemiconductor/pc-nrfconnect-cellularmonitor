/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const raceTimeout = <T>(promise: Promise<T>, timeout = 1000) =>
    Promise.race([
        promise,
        new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, timeout);
        }),
    ]);
