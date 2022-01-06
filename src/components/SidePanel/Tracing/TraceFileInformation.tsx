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
import {
    CollapsibleGroup,
    truncateMiddle,
    usageData,
} from 'pc-nrfconnect-shared';

import {
    getSerialPort,
    getTraceProgress,
    TraceProgress,
} from '../../../features/tracing/traceSlice';
import EventAction from '../../../usageDataActions';
import { getNameAndDirectory, openInFolder } from '../../../utils/fileUtils';
import {
    getCollapseTraceDetailsSection,
    setCollapseTraceDetailsSection,
} from '../../../utils/store';
import DiskSpaceUsage from './DiskSpaceUsage/DiskSpaceUsage';
import DiskSpaceUsageBox from './DiskSpaceUsage/DiskSpaceUsageBox';
import TraceConverter from './TraceConverter';

const TraceFileName: FC<{
    progress: TraceProgress;
    truncate: boolean;
    label?: string;
}> = ({
    progress,
    truncate,
    label = `${progress.format.toUpperCase()} file name`,
}) => {
    const [filename] = getNameAndDirectory(progress.path);

    return (
        <div className="trace-filename-wrapper">
            <FormLabel>{label}</FormLabel>
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
                {truncate ? truncateMiddle(filename, 5, 12) : filename}
            </span>
        </div>
    );
};

export const TraceFileDetails: FC<{
    progress: TraceProgress;
    truncate?: boolean;
    label?: string;
}> = ({ progress, label, truncate = true }) => (
    <div className="trace-file-container">
        <TraceFileName progress={progress} truncate={truncate} label={label} />
        {progress.size != null && (
            <DiskSpaceUsageBox label="File size" value={progress.size} />
        )}
    </div>
);

export default () => {
    const progress = useSelector(getTraceProgress);
    const isDeviceSelected = !!useSelector(getSerialPort);

    if (isDeviceSelected && progress.length === 0) {
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
            {!isDeviceSelected && <TraceConverter />}
            {progress.length > 0 && <DiskSpaceUsage />}
            {progress.map(progressItem => (
                <TraceFileDetails
                    key={progressItem.format}
                    progress={progressItem}
                />
            ))}
        </CollapsibleGroup>
    );
};
