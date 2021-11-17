/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import FormLabel from 'react-bootstrap/FormLabel';
import { useSelector } from 'react-redux';

import { getTraceData } from '../../features/tracing/traceSlice';
import { truncateMiddle } from '../../utils';
import { getNameAndDirectory, openInFolder } from '../../utils/fileUtils';
import DiskSpaceUsage from './DiskSpaceUsage/DiskSpaceUsage';
import DiskSpaceUsageBox from './DiskSpaceUsage/DiskSpaceUsageBox';

export default () => {
    const traceData = useSelector(getTraceData);
    let directory: string;
    if (traceData.length === 0) {
        return null;
    }

    const traceDetails = traceData.map(trace => {
        const [filename, dir] = getNameAndDirectory(trace.path);
        directory = dir;
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
        <>
            <DiskSpaceUsage />
            {traceDetails}
            <Button
                className="w-100 secondary-btn btn-size-small"
                variant="secondary"
                onClick={() => {
                    openInFolder(directory);
                }}
            >
                Open folder location
            </Button>
        </>
    );
};
