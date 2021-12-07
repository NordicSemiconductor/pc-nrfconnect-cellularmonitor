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
    getTraceProgress,
    TraceProgress,
} from '../../../features/tracing/traceSlice';
import EventAction from '../../../usageDataActions';
import { truncateMiddle } from '../../../utils';
import { getNameAndDirectory, openInFolder } from '../../../utils/fileUtils';
import DiskSpaceUsage from './DiskSpaceUsage/DiskSpaceUsage';
import DiskSpaceUsageBox from './DiskSpaceUsage/DiskSpaceUsageBox';

const TraceFileName: FC<{ progress: TraceProgress }> = ({ progress }) => {
    const [filename] = getNameAndDirectory(progress.path);

    return (
        <div className="trace-filename-wrapper">
            <FormLabel>{`${progress.format.toUpperCase()} file name`}</FormLabel>
            <span
                className="trace-filename"
                onClick={() => {
                    usageData.sendUsageData(
                        EventAction.OPEN_FILE_DIRECTORY,
                        progress.format
                    );
                    openInFolder(progress.path);
                }}
                title={filename}
            >
                {truncateMiddle(filename, 5, 12)}
            </span>
        </div>
    );
};

const TraceFileDetails: FC<{ progress: TraceProgress }> = ({ progress }) => (
    <div className="trace-file-container">
        <TraceFileName progress={progress} />
        <DiskSpaceUsageBox label="File size" value={progress.size} />
    </div>
);

export default () => {
    const progress = useSelector(getTraceProgress);

    if (progress.length === 0) {
        return null;
    }

    return (
        <CollapsibleGroup heading="Trace Details" defaultCollapsed={false}>
            <DiskSpaceUsage />
            {progress.map(progressItem => (
                <TraceFileDetails
                    key={progressItem.format}
                    progress={progressItem}
                />
            ))}
        </CollapsibleGroup>
    );
};
