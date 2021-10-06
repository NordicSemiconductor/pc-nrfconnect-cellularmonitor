/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useSelector } from 'react-redux';

import { getTracePath } from '../../features/tracing/traceSlice';
import { getNameAndDirectory } from '../../utils/fileUtils';
import DiskSpaceUsage from './DiskSpaceUsage/DiskSpaceUsage';
import FilePathLink from './FilePathLink';

export default () => {
    const tracePath = useSelector(getTracePath);
    if (tracePath === '') {
        return null;
    }
    const [filename, directory] = getNameAndDirectory(tracePath);

    return (
        <>
            <FilePathLink
                label="Trace output location"
                filePath={tracePath}
                displayPath={directory}
            />
            <DiskSpaceUsage />

            <div className="trace-file-container">
                <FormLabel>Filename</FormLabel>
                <span className="trace-file-name">{filename}</span>
            </div>
        </>
    );
};
