/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { setTracePath } from '../../../features/tracing/traceSlice';
import { mockedCheckDiskSpace, render } from '../../../utils/testUtils';
import TracefileInformation from '../TracefileInformation';

describe('FileInformation', () => {
    it('should display the name of the trace', async () => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        const filePath = 'path/to/file.bin';
        const screen = render(<TracefileInformation />, [
            setTracePath(filePath),
        ]);
        expect(await screen.findByText('path/to')).toBeInTheDocument();
        expect(await screen.findByText('file.bin')).toBeInTheDocument();
    });
});
