/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, { ModuleVersion } from '@nordicsemiconductor/nrf-monitor-lib-js';
import nrfMonitorLibJsPackageJson from '@nordicsemiconductor/nrf-monitor-lib-js/package.json';
import { logger } from 'pc-nrfconnect-shared';

const version = (module: ModuleVersion) => {
    switch (module.version_format) {
        case 'NRFML_VERSION_FORMAT_INCREMENTAL':
            return module.incremental;
        case 'NRFML_VERSION_FORMAT_STRING':
            return module.string;
        case 'NRFML_VERSION_FORMAT_SEMANTIC':
            return `${module.semver.major}.${module.semver.minor}.${module.semver.patch}`;
    }
};

export default async () => {
    const { modules } = await nrfml.apiVersion();

    logger.info(
        `Using nrf-monitor-lib-js version  ${nrfMonitorLibJsPackageJson.version}`
    );
    if (modules.length > 0) {
        // In this case, we always expect to only have one module, namely nrfml
        logger.info(`Using nrf-monitor-lib version ${version(modules[0])}`);
    }
};
