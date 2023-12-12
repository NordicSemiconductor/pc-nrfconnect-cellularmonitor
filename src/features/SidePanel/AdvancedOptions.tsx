/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
    CollapsibleGroup,
    selectedDevice,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import ProgramSampleModal from '../programSample/ProgramSampleModal';
import SourceSelector from '../terminal/SourceSelector';

export default () => {
    const device = useSelector(selectedDevice);

    if (!device) return null;

    return (
        <CollapsibleGroup heading="Advanced Options" defaultCollapsed={false}>
            <ProgramSampleModal />
            <SourceSelector />
        </CollapsibleGroup>
    );
};