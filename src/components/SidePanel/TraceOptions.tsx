/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, selectedDevice } from 'pc-nrfconnect-shared';

import DatabaseFileOverride from './DatabaseFileOverride';
import Serialports from './Serialports';
import TraceFormatSelector from './Tracing/TraceFormatSelector';

export default () => {
    const device = useSelector(selectedDevice);
    if (!device) return null;

    return (
        <CollapsibleGroup defaultCollapsed={false} heading="TRACE OPTIONS">
            <TraceFormatSelector />
            <DatabaseFileOverride />
            <Serialports />
        </CollapsibleGroup>
    );
};
