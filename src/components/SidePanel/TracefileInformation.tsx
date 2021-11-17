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
                <div
                    className="trace-file-name-wrapper"
                    onClick={() => openInFolder(trace.path)}
                >
                    <FormLabel>{`${trace.format.toUpperCase()} file name`}</FormLabel>
                    <span className="trace-file-name">
                        {truncateMiddle(filename, 10, 10)}
                    </span>
                </div>
                <div className="trace-file-size" />
                <FormLabel>{`${trace.format.toUpperCase()} file name`}</FormLabel>
                <span className="trace-file-name">
                    <DiskSpaceUsageBox label="File size" value={trace.size} />
                </span>
            </div>
        );
    });

    return (
        <>
            <DiskSpaceUsage />
            {traceDetails}
            <Button
                className="w-100 secondary-btn"
                variant="secondary"
                onClick={() => {
                    openInFolder(directory);
                }}
                style={{ height: 24, padding: 0, fontSize: 12, marginTop: 8 }}
            >
                Open folder location
            </Button>
        </>
    );
};
