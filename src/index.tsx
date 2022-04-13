/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { logger } from 'pc-nrfconnect-shared';

logger.info('X');

export default () => <h1>{new Date().toISOString()}</h1>;
