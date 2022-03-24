/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

import Main from './Terminal';

export default () => (
    <App
        deviceSelect={null}
        sidePanel={null}
        showLogByDefault={false}
        panes={[
            {
                name: 'Terminal',
                Main,
            },
        ]}
    />
);
