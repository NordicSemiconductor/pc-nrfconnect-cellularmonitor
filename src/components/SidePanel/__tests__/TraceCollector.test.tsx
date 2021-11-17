/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import {
    setAvailableSerialPorts,
    setSerialPort,
} from '../../../features/tracing/traceSlice';
import {
    fireEvent,
    mockedCheckDiskSpace,
    render,
} from '../../../utils/testUtils';
import TraceCollector from '../TraceCollector';

mockedCheckDiskSpace.mockImplementation(
    () =>
        new Promise(resolve => {
            resolve({ free: 0, size: 0 });
        })
);

const serialPortActions = [
    setAvailableSerialPorts(['COM1', 'COM2', 'COM3']),
    setSerialPort('COM1'),
];

describe('TraceCollector', () => {
    it('should disable Trace format selector while tracing', async () => {
        const screen = render(<TraceCollector />, serialPortActions);
        const traceFormatButton = await screen.findByText('raw');
        fireEvent.click(traceFormatButton);
        fireEvent.click(screen.getByText('Start tracing'));
        expect(traceFormatButton).toBeDisabled();
    });

    it('button text should reflect tracing state', async () => {
        const screen = render(<TraceCollector />, serialPortActions);
        const traceFormatButton = await screen.findByText('raw');
        fireEvent.click(traceFormatButton);
        fireEvent.click(screen.getByText('Start tracing'));
        const stopButton = await screen.findByText('Stop tracing');
        fireEvent.click(stopButton);
        expect(await screen.findByText('Start tracing')).toBeInTheDocument();
    });
});
