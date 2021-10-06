/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { logger } from 'pc-nrfconnect-shared';

export default () => {
    useEffect(() => {
        logger.info('Showing GPS pane');
        return () => {
            logger.info('Hiding GPS pane');
        };
    }, []);

    return <h3 className="title">GPS</h3>;
};
