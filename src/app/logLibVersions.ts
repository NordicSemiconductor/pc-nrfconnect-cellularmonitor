/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
import nrfMonitorLibJsPackageJson from '@nordicsemiconductor/nrf-monitor-lib-js/package.json';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

interface NrfmlVersion {
    major: number;
    minor: number;
    patch: number;
}
const formatVersion = ({ major, minor, patch }: NrfmlVersion) =>
    `${major}.${minor}.${patch}`;

export default async () => {
    const version = (await nrfml.apiVersion()) as unknown as NrfmlVersion;
    logger.info(
        `Using nrf-monitor-lib-js version  ${nrfMonitorLibJsPackageJson.version}`,
    );
    if (version != null) {
        // In this case, we always expect to only have one module, namely nrfml
        logger.info(`Using nrf-monitor-lib version ${formatVersion(version)}`);
    }
};
