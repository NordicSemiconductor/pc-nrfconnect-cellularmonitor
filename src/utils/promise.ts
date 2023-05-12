/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const raceTimeout = <T>(promise: Promise<T>, timeout: number) =>
    Promise.race([
        promise,
        new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, timeout);
        }),
    ]);
