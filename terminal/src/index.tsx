/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

export default () => (
    <App
        deviceSelect={<div />}
        sidePanel={<div />}
        panes={[
            {
                name: 'Terminal',
                Main: () => <div>Terminal</div>,
                SidePanel: undefined,
            },
        ]}
    />
);
