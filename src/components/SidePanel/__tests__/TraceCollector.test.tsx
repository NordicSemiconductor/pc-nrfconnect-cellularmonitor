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
import * as wireshark from '../../../features/wireshark/wireshark';
import {
    expectNrfmlStartCalledWithSinks,
    fireEvent,
    mockedCheckDiskSpace,
    render,
    screen,
} from '../../../utils/testUtils';
import TraceCollector from '../Tracing/TraceCollector';

jest.mock('../../../features/wireshark/wireshark');

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
        render(<TraceCollector />, serialPortActions);
        const startButton = screen.getByText('Start tracing');
        expect(startButton).toBeDisabled();
    });

    it('should disable Trace format selector while tracing', async () => {
        render(<TraceCollector />, serialPortActions);
        const traceFormatButton = await screen.findByText('raw');
        fireEvent.click(traceFormatButton);
        fireEvent.click(screen.getByText('Start tracing'));
        expect(traceFormatButton).toBeDisabled();
    });

    it('button text should reflect tracing state', async () => {
        render(<TraceCollector />, serialPortActions);
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
            render(<TraceCollector />, [...serialPortActions]);
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
            render(<TraceCollector />, [...serialPortActions]);
            const traceFormatButton = await screen.findByText('live');
            fireEvent.click(traceFormatButton);
            expect(
                screen.queryByText('Wireshark not detected')
            ).not.toBeInTheDocument();
        });
    });

    describe('sink configurations', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.spyOn(wireshark, 'findTshark').mockReturnValue(
                'path/to/tshark'
            );
        });

        it('should call nrfml start with selected sink configurations as arguments', async () => {
            render(<TraceCollector />, serialPortActions);
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(screen.getByText('Start tracing'));

            expectNrfmlStartCalledWithSinks(
                'nrfml-raw-file-sink',
                'nrfml-tshark-sink'
            );
        });

        it('should call nrfml start with selected sink configurations as arguments', async () => {
            render(<TraceCollector />, serialPortActions);
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));

            expectNrfmlStartCalledWithSinks(
                'nrfml-raw-file-sink',
                'nrfml-pcap-sink',
                'nrfml-tshark-sink'
            );
        });

        it('should call nrfml start with selected sink configurations as arguments', async () => {
            render(<TraceCollector />, serialPortActions);
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(await screen.findByText('live'));
            fireEvent.click(screen.getByText('Start tracing'));

            expectNrfmlStartCalledWithSinks(
                'nrfml-raw-file-sink',
                'nrfml-pcap-sink',
                'nrfml-tshark-sink',
                'nrfml-wireshark-named-pipe-sink'
            );
        });
    });

    describe('tshark not installed', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should call nrfml start without tshark sink', async () => {
            jest.spyOn(wireshark, 'findTshark').mockReturnValue(null);
            render(<TraceCollector />, serialPortActions);
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(screen.getByText('Start tracing'));

            expectNrfmlStartCalledWithSinks('nrfml-raw-file-sink');
        });
    });
});
