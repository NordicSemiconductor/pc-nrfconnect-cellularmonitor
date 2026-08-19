/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml from '@nordicsemi/nrfml-js';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

export default async () => {
    const version = await nrfml.version();
    logger.info(`Using nrfml-js version  ${version.version}`);
    Object.keys(version.dependencies).forEach(k => {
        logger.info(`Using ${k} version ${version.dependencies[k]}`);
    });
};
