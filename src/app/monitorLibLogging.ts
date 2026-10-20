/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, {
    type Logger,
    LoggerBackend,
    LogLevel,
} from '@nordicsemi/nrfml-js';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { getIsLoggingVerbose } from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/persistentStore';

let nrfmlLogger: Logger;
export function enableNrfmlLogging() {
    nrfmlLogger = nrfml.initLogger(
        // @ts-expect-error The enums work
        LoggerBackend.Callback,
        // @ts-expect-error The enums work
        LogLevel.Off,
        undefined,
        (message: string) => {
            logger.debug(message.trim());
        },
    );
    setNrfmlLogLevel(getIsLoggingVerbose());
}

export function setNrfmlLogLevel(verbose: boolean) {
    if (!nrfmlLogger) {
        logger.error(
            'Failed to change log level for nrfml-js logging: No nrfml-js logger object.',
        );
        return;
    }

    // @ts-expect-error The enums work
    const logLevel = verbose ? LogLevel.Trace : LogLevel.Off;
    nrfmlLogger.setLevel(logLevel);

    if (logLevel > 0) {
        logger.info(
            `nrfml-js logging with is enabled with log level: ${logLevel}.`,
        );
    } else {
        logger.info('nrfml-js logging is disabled.');
    }
}
