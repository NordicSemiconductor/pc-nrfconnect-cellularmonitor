/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import {
    setTraceData,
    TraceProgress,
} from '../../../features/tracing/traceSlice';
import { mockedCheckDiskSpace, render } from '../../../utils/testUtils';
import TraceFileInformation from '../Tracing/TraceFileInformation';

describe('FileInformation', () => {
    it('should display the name and size of the trace', async () => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        const filePath = 'path/to/file.bin';
        const traceData: TraceProgress = {
            format: 'raw',
            path: filePath,
            size: 1000,
        };
        const screen = render(<TraceFileInformation />, [
            setTraceData([traceData]),
        ]);
        expect(await screen.findByText('file.bin')).toBeInTheDocument();
        expect(await screen.findByText('1 kB')).toBeInTheDocument();
    });
});
