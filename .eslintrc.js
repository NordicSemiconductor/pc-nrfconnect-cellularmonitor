/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const defaultEslintrc = require('@nordicsemiconductor/pc-nrfconnect-shared/config/eslintrc');

module.exports = {
    ...defaultEslintrc,
    ignorePatterns: [
        ...defaultEslintrc.ignorePatterns,
        'resources/traceDB',
        'resources/firmware',
    ],
};
