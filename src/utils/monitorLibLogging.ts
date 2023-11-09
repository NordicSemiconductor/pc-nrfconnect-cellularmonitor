/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { getIsLoggingVerbose } from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/persistentStore';

export function enableNrfmlLogging() {
    setNrfmlLogLevel(getIsLoggingVerbose());

    nrfml.startLogEvents(
        () => logger.debug('Logging from nrf-monitor-lib has been disabled.'),
        logEvent => {
            logger.debug(logEvent.message);
        }
    );
    logger.info(`Enabled logging from nrf-monitor-lib.`);
}

export function setNrfmlLogLevel(verbose: boolean) {
    const logLevel = verbose ? nrfml.NRFML_LOG_TRACE : nrfml.NRFML_LOG_OFF;
    nrfml.setLogLevel(logLevel);

    logger.info(`Changed log level from nrf-monitor-lib to: "${logLevel}"`);
}
