/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const webpack = require('webpack');
const config = require('pc-nrfconnect-shared/config/webpack.config');

config.module.rules[0].use[0].options.configFile =
    '../node_modules/pc-nrfconnect-shared/config/babel.config.js';

const handleOutput = (err, stats) => {
    if (err) {
        console.error(err.stack || err);
        if (err.details) {
            console.error(err.details);
        }
        return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
        console.error(info.errors);
    }

    if (stats.hasWarnings()) {
        console.warn(info.warnings);
    }

    console.log(
        stats.toString({
            chunks: false, // Makes the build much quieter
            colors: true, //  Shows colors in the console
        })
    );

    process.exitCode = stats.hasErrors() ? 1 : 0;
};

webpack(config).watch({}, handleOutput);
