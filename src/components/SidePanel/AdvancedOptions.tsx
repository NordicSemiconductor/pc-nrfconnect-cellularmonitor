/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { CollapsibleGroup } from 'pc-nrfconnect-shared';

import DatabaseFileOverride from './DatabaseFileOverride';

export default () => (
    <CollapsibleGroup heading="Advanced Options" defaultCollapsed>
        <DatabaseFileOverride />
    </CollapsibleGroup>
);
