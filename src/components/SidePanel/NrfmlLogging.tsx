/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
import { colors, logger, Toggle } from 'pc-nrfconnect-shared';

nrfml.setLogLevel(nrfml.NRFML_LOG_TRACE);
nrfml.setLogPattern('%n %T.%e %v');

export default () => {
    let taskId: number;

    const toggleNrfmlLogs = (enable: boolean) => {
        if (enable)
            taskId = nrfml.startLogEvents(
                () => {},
                evt => {
                    switch (evt.level) {
                        case nrfml.NRFML_LOG_TRACE:
                            logger.verbose(evt.message);
                            break;
                        case nrfml.NRFML_LOG_DEBUG:
                            logger.debug(evt.message);
                            break;
                        case nrfml.NRFML_LOG_INFO:
                            logger.info(evt.message);
                            break;
                        case nrfml.NRFML_LOG_WARNING:
                            logger.warn(evt.message);
                            break;
                        case nrfml.NRFML_LOG_ERROR:
                            logger.error(evt.message);
                            break;
                        case nrfml.NRFML_LOG_CRITICAL:
                            logger.error(evt.message);
                            break;
                    }
                }
            );
        else nrfml.stopLogEvents(taskId);
    };

    return (
        <Toggle
            id="enableVerboseLoggin"
            label="VERBOSE LOGGING"
            onToggle={toggled => toggleNrfmlLogs(!!toggled)}
            variant="primary"
            handleColor={colors.white}
            barColor={colors.gray700}
            barColorToggled={colors.nordicBlue}
        />
    );
};
