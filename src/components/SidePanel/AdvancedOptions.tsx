/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, selectedDevice } from 'pc-nrfconnect-shared';

import FlashSampleModal from '../../features/flashSample/FlashSampleModal';
import SourceSelector from '../../features/terminal/SourceSelector';
import { FullNetworkReport } from './Macros';

export default () => {
    const device = useSelector(selectedDevice);

    if (!device) return null;

    return (
        <CollapsibleGroup heading="Advanced Options" defaultCollapsed>
            <FlashSampleModal />
            <SourceSelector />
            <FullNetworkReport />
        </CollapsibleGroup>
    );
};
