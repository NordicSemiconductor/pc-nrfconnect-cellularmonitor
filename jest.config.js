/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
const path = require('path');

const config = require('pc-nrfconnect-shared/config/jest.config')([
    'serialport',
]);

config.setupFilesAfterEnv.push(
    path.join(__dirname, 'src', 'utils', 'polyfillJest.js')
);

module.exports = config;
