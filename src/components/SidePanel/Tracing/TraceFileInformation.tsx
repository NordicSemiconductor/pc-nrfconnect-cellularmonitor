/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup } from 'pc-nrfconnect-shared';

import {
    getIsDeviceSelected,
    getTraceProgress,
} from '../../../features/tracing/traceSlice';
import {
    getCollapseTraceDetailsSection,
    setCollapseTraceDetailsSection,
} from '../../../utils/store';
import DiskSpaceUsage from './DiskSpaceUsage/DiskSpaceUsage';
import TraceFileDetails from './TraceFileDetails';

export default () => {
    const progress = useSelector(getTraceProgress);

    if (progress.length === 0) {
        return null;
    }

    return (
        <CollapsibleGroup
            heading="Trace Details"
            defaultCollapsed={getCollapseTraceDetailsSection()}
            onToggled={isNowExpanded =>
                setCollapseTraceDetailsSection(!isNowExpanded)
            }
        >
            {progress.length > 0 && <DiskSpaceUsage />}
            {progress.map(progressItem => (
                <TraceFileDetails
                    key={progressItem.format}
                    progress={progressItem}
                    truncate
                />
            ))}
        </CollapsibleGroup>
    );
};
