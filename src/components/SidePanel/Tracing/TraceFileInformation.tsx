/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useSelector } from 'react-redux';
import { CollapsibleGroup } from 'pc-nrfconnect-shared';

import { getTraceData } from '../../../features/tracing/traceSlice';
import { truncateMiddle } from '../../../utils';
import { getNameAndDirectory, openInFolder } from '../../../utils/fileUtils';
import DiskSpaceUsage from './DiskSpaceUsage/DiskSpaceUsage';
import DiskSpaceUsageBox from './DiskSpaceUsage/DiskSpaceUsageBox';

export default () => {
    const traceData = useSelector(getTraceData);
    if (traceData.length === 0) {
        return null;
    }

    const traceDetails = traceData.map(trace => {
        const [filename] = getNameAndDirectory(trace.path);
        return (
            <div className="trace-file-container" key={trace.format}>
                <div className="trace-filename-wrapper">
                    <FormLabel>{`${trace.format.toUpperCase()} file name`}</FormLabel>
                    <span
                        className="trace-filename"
                        onClick={() => openInFolder(trace.path)}
                        title={filename}
                    >
                        {truncateMiddle(filename, 5, 12)}
                    </span>
                </div>
                <DiskSpaceUsageBox label="File size" value={trace.size} />
            </div>
        );
    });

    return (
        <CollapsibleGroup heading="Trace Details" defaultCollapsed={false}>
            <DiskSpaceUsage />
            {traceDetails}
        </CollapsibleGroup>
    );
};
