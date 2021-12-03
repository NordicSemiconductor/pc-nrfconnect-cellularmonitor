/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { FC } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, usageData } from 'pc-nrfconnect-shared';

import {
    getTraceData,
    TraceProgress,
} from '../../../features/tracing/traceSlice';
import EventAction from '../../../usageDataActions';
import { truncateMiddle } from '../../../utils';
import { getNameAndDirectory, openInFolder } from '../../../utils/fileUtils';
import DiskSpaceUsage from './DiskSpaceUsage/DiskSpaceUsage';
import DiskSpaceUsageBox from './DiskSpaceUsage/DiskSpaceUsageBox';

const TraceFileName: FC<{ trace: TraceProgress }> = ({ trace }) => {
    const [filename] = getNameAndDirectory(trace.path);

    return (
        <div className="trace-filename-wrapper">
            <FormLabel>{`${trace.format.toUpperCase()} file name`}</FormLabel>
            <span
                className="trace-filename"
                onClick={() => {
                    usageData.sendUsageData(
                        EventAction.OPEN_FILE_DIRECTORY,
                        trace.format
                    );
                    openInFolder(trace.path);
                }}
                title={filename}
            >
                {truncateMiddle(filename, 5, 12)}
            </span>
        </div>
    );
};

const TraceFileDetails: FC<{ trace: TraceProgress }> = ({ trace }) => {
    if (trace.format === 'live') {
        return null;
    }

    return (
        <div className="trace-file-container">
            <TraceFileName trace={trace} />
            <DiskSpaceUsageBox label="File size" value={trace.size} />
        </div>
    );
};

export default () => {
    const traceData = useSelector(getTraceData);

    const noTraceData = traceData.length === 0;
    const onlyDoingLiveTracing =
        traceData.length === 1 && traceData[0].format === 'live';

    if (noTraceData || onlyDoingLiveTracing) {
        return null;
    }

    return (
        <CollapsibleGroup heading="Trace Details" defaultCollapsed={false}>
            <DiskSpaceUsage />
            {traceData.map(trace => (
                <TraceFileDetails key={trace.format} trace={trace} />
            ))}
        </CollapsibleGroup>
    );
};
