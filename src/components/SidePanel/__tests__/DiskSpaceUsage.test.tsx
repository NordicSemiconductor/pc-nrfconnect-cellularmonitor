/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import prettyBytes from 'pretty-bytes';

import { mockedCheckDiskSpace, render } from '../../../utils/testUtils';
import DiskSpaceUsage from '../DiskSpaceUsage/DiskSpaceUsage';

const FREE = 100;
const TOTAL = 200;

describe('Disk space usage', () => {
    it('should display free and total disk space', async () => {
        mockedCheckDiskSpace.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolve({
                        free: FREE,
                        size: TOTAL,
                    });
                })
        );
        const screen = render(<DiskSpaceUsage />);
        expect(await screen.findByText(prettyBytes(FREE))).toBeInTheDocument();
        expect(await screen.findByText(prettyBytes(TOTAL))).toBeInTheDocument();
    });

    it('should display loading message if disk is still unknown', async () => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        const screen = render(<DiskSpaceUsage />);
        const loadingMessage = 'Loading';
        const loadingBoxes = await screen.findAllByText(loadingMessage);
        expect(loadingBoxes.length).toBe(2);
    });
});
