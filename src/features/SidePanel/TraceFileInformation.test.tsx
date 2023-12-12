/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { mockedCheckDiskSpace, render, screen } from '../../common/testUtils';
import { setTraceIsStarted, setTraceProgress } from '../tracing/traceSlice';
import TraceFileInformation from './Tracing/TraceFileInformation';

describe('FileInformation', () => {
    it('should display the name and size of the trace', async () => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        const filePath = 'path/to/file.bin';
        render(<TraceFileInformation />, [
            setTraceIsStarted({
                taskId: 1n,
                progressConfigs: [{ format: 'raw', path: filePath }],
            }),
            setTraceProgress({ path: filePath, size: 1000 }),
        ]);
        expect(await screen.findByText('file.bin')).toBeInTheDocument();
        expect(await screen.findByText('1 kB')).toBeInTheDocument();
    });
});
