/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getTraceProgress } from '../../tracing/traceSlice';
import DiskSpaceUsage from './DiskSpaceUsage/DiskSpaceUsage';
import TraceFileDetails from './TraceFileDetails';

export default () => {
    const progress = useSelector(getTraceProgress);

    if (progress.length === 0) {
        return null;
    }

    return (
        <>
            {progress.length > 0 && <DiskSpaceUsage />}
            {progress.map(progressItem => (
                <TraceFileDetails
                    key={progressItem.format}
                    progress={progressItem}
                    truncate
                />
            ))}
        </>
    );
};
