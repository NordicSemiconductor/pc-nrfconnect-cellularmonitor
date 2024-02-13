/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { FC } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import {
    telemetry,
    truncateMiddle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../../app/usageDataActions';
import { getNameAndDirectory, openInFolder } from '../../../common/fileUtils';
import { TraceProgress } from '../../tracing/traceSlice';
import DiskSpaceUsageBox from './DiskSpaceUsage/DiskSpaceUsageBox';

const TraceFileName: FC<{
    progress: TraceProgress;
    truncate?: boolean;
    label?: string;
}> = ({
    progress,
    truncate = false,
    label = `${progress.format.toUpperCase()} file name`,
}) => {
    const [filename] = getNameAndDirectory(progress.path);

    return (
        <div className="trace-filename-wrapper">
            <FormLabel>{label}</FormLabel>
            <span
                className="trace-filename"
                onClick={() => {
                    telemetry.sendEvent(EventAction.OPEN_FILE_DIRECTORY, {
                        traceProgress: progress,
                        format: progress.format,
                        path: progress.path,
                    });
                    openInFolder(progress.path);
                }}
                title={filename}
            >
                {truncate ? truncateMiddle(filename, 5, 12) : filename}
            </span>
        </div>
    );
};

const TraceFileDetails: FC<{
    progress: TraceProgress;
    truncate?: boolean;
    label?: string;
}> = ({ progress, label, truncate }) => (
    <div className="trace-file-container">
        <TraceFileName progress={progress} truncate={truncate} label={label} />
        {progress.size != null && (
            <DiskSpaceUsageBox label="File size" value={progress.size} />
        )}
    </div>
);

export default TraceFileDetails;
