/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export function secondsToDhms(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    let result = '';

    if (d > 0) {
        result += `${d} day${d > 1 ? 's' : ''}`;
    }
    if (h > 0) {
        if (result.length > 0) {
            result += ', ';
        }
        result += `${h} hour${h > 1 ? 's' : ''}`;
    }
    if (m > 0) {
        if (result.length > 0) {
            result += ', ';
        }
        result += `${m} minute${m > 1 ? 's' : ''}`;
    }
    if (s > 0) {
        if (result.length > 0) {
            result += ', ';
        }
        result += `${s} second${s > 1 ? 's' : ''}`;
    }

    return result;
}
