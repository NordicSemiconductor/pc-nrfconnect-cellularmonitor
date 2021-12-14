/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';

import {
    setAvailableSerialPorts,
    setSerialPort,
} from '../../../features/tracing/traceSlice';
import {
    fireEvent,
    mockedCheckDiskSpace,
    render,
} from '../../../utils/testUtils';
import * as wireshark from '../../../utils/wireshark';
import TraceCollector from '../Tracing/TraceCollector';

jest.mock('../../../utils/wireshark');

jest.mock('pc-nrfconnect-shared', () => ({
    ...jest.requireActual('pc-nrfconnect-shared'),
    getAppDataDir: () => '',
}));

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
    it('should disable Start button if no trace formats are selected', () => {
        const screen = render(<TraceCollector />, serialPortActions);
        const startButton = screen.getByText('Start tracing');
        expect(startButton).toBeDisabled();
    });

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

    describe('wireshark installation', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should display warning if wireshark is not installed and live tracing is selected', async () => {
            jest.spyOn(wireshark, 'findWireshark').mockReturnValue(null);
            const screen = render(<TraceCollector />, [...serialPortActions]);
            const traceFormatButton = await screen.findByText('live');
            fireEvent.click(traceFormatButton);
            expect(
                await screen.findByText('Wireshark not detected')
            ).toBeInTheDocument();
        });

        it('should not display warning if wireshark is installed and live tracing is selected', async () => {
            jest.spyOn(wireshark, 'findWireshark').mockReturnValue(
                'path/to/wireshark'
            );
            const screen = render(<TraceCollector />, [...serialPortActions]);
            const traceFormatButton = await screen.findByText('live');
            fireEvent.click(traceFormatButton);
            expect(
                await screen.queryByText('Wireshark not detected')
            ).not.toBeInTheDocument();
        });
    });

    describe('sink configurations', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should call nrfml start with selected sink configurations as arguments', async () => {
            const screen = render(<TraceCollector />, serialPortActions);
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(screen.getByText('Start tracing'));

            expect(nrfml.start).toHaveBeenCalled();
            // @ts-ignore -- ts doesn't know that nrfml.start has been mocked
            const args = nrfml.start.mock.calls[0][0];
            expect(args.sinks.length).toBe(2); // raw + opp which is always added in the background
        });

        it('should call nrfml start with selected sink configurations as arguments', async () => {
            const screen = render(<TraceCollector />, serialPortActions);
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));

            expect(nrfml.start).toHaveBeenCalled();
            // @ts-ignore -- ts doesn't know that nrfml.start has been mocked
            const args = nrfml.start.mock.calls[0][0];
            expect(args.sinks.length).toBe(3); // raw + opp which is always added in the background
        });

        it('should call nrfml start with selected sink configurations as arguments', async () => {
            const screen = render(<TraceCollector />, serialPortActions);
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(await screen.findByText('live'));
            fireEvent.click(screen.getByText('Start tracing'));

            expect(nrfml.start).toHaveBeenCalled();
            // @ts-ignore -- ts doesn't know that nrfml.start has been mocked
            const args = nrfml.start.mock.calls[0][0];
            expect(args.sinks.length).toBe(4); // raw + opp which is always added in the background
        });
    });
});
