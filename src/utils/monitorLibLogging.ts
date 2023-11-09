/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { getIsLoggingVerbose } from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/persistentStore';

export function enableNrfmlLogging() {
    nrfml.startLogEvents(
        () => logger.debug('Logging from nrf-monitor-lib has been disabled.'),
        logEvent => {
            logger.debug(logEvent.message);
        }
    );
    setNrfmlLogLevel(getIsLoggingVerbose());
}

export function setNrfmlLogLevel(verbose: boolean) {
    const logLevel = verbose ? nrfml.NRFML_LOG_TRACE : nrfml.NRFML_LOG_OFF;
    nrfml.setLogLevel(logLevel);

    if (logLevel > 0) {
        logger.info(
            `nrf-monitor-lib logging with is enabled with log level: ${logLevel}.`
        );
    } else {
        logger.info('nrf-monitor-lib logging is disabled.');
    }
}
