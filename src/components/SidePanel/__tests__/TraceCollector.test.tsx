/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import {
    setAvailableSerialPorts,
    setSerialPort,
    setTraceFormats,
} from '../../../features/tracing/traceSlice';
import * as wireshark from '../../../features/wireshark/wireshark';
import { setWiresharkPath } from '../../../features/wireshark/wiresharkSlice';
import {
    act,
    expectNrfmlStartCalledWithSinks,
    fireEvent,
    mockedCheckDiskSpace,
    mockedDataDir,
    render,
    screen,
} from '../../../utils/testUtils';
import TraceCollector from '../Tracing/TraceCollector';

jest.mock('../../../features/wireshark/wireshark');
jest.mock('pc-nrfconnect-shared', () => ({
    ...jest.requireActual('pc-nrfconnect-shared'),
    getAppDataDir: () => mockedDataDir,
    getAppFile: () => mockedDataDir,
}));

mockedCheckDiskSpace.mockImplementation(
    () =>
        new Promise(resolve => {
            resolve({ free: 0, size: 0 });
        })
);

const serialPortActions = (
    formats: Parameters<typeof setTraceFormats>[0] = []
) => [
    setTraceFormats(formats),
    setAvailableSerialPorts(['COM1', 'COM2', 'COM3']),
    setSerialPort('COM1'),
];

describe('TraceCollector', () => {
    it('should disable Start button if no trace formats are selected', () => {
        render(<TraceCollector />, serialPortActions());

        const startButton = screen.getByText('Start');
        expect(startButton).toBeDisabled();
    });

    it('button text should reflect tracing state', async () => {
        jest.useFakeTimers();
        render(<TraceCollector />, serialPortActions(['raw']));
        fireEvent.click(screen.getByText('Start'));

        act(jest.runOnlyPendingTimers);

        const stopButton = await screen.findByText('Stop');
        fireEvent.click(stopButton);
        expect(await screen.findByText('Start')).toBeInTheDocument();

        jest.useRealTimers();
    });

    describe('wireshark installation', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should not display warning if wireshark is installed and live tracing is selected', () => {
            jest.spyOn(wireshark, 'findWireshark').mockReturnValue(
                'path/to/wireshark'
            );
            render(<TraceCollector />, serialPortActions(['live']));

            expect(
                screen.queryByText('Wireshark not detected')
            ).not.toBeInTheDocument();
        });
    });

    test('renders InstallWiresharkDialog if wireshak is not found', () => {
        jest.spyOn(wireshark, 'findWireshark').mockReturnValue(null);
        render(<TraceCollector />, serialPortActions(['live']));

        fireEvent.click(screen.getByText('Start'));

        expect(
            screen.getByText('Could not find Wireshark')
        ).toBeInTheDocument();
        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.queryByText('Stop')).not.toBeInTheDocument();
    });

    describe('sink configurations', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.spyOn(wireshark, 'findTshark').mockReturnValue(
                'path/to/tshark'
            );
        });

        it('should call nrfml start with selected sink configurations as arguments', () => {
            render(<TraceCollector />, [
                ...serialPortActions(['raw']),
                setWiresharkPath('path/to/wireshark'),
            ]);
            fireEvent.click(screen.getByText('Start'));

            expectNrfmlStartCalledWithSinks(
                'nrfml-raw-file-sink',
                'nrfml-tshark-sink'
            );
        });

        it('should call nrfml start with selected sink configurations as arguments', () => {
            render(<TraceCollector />, [
                ...serialPortActions(['raw', 'pcap']),
                setWiresharkPath('path/to/wireshark'),
            ]);
            fireEvent.click(screen.getByText('Start'));

            expectNrfmlStartCalledWithSinks(
                'nrfml-raw-file-sink',
                'nrfml-pcap-sink',
                'nrfml-tshark-sink'
            );
        });

        it('should call nrfml start with selected sink configurations as arguments', () => {
            render(<TraceCollector />, [
                ...serialPortActions(['raw', 'pcap', 'live']),
                setWiresharkPath('path/to/wireshark'),
            ]);
            fireEvent.click(screen.getByText('Start'));

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

        it('should call nrfml start without tshark sink', () => {
            jest.spyOn(wireshark, 'findTshark').mockReturnValue(null);
            render(<TraceCollector />, serialPortActions(['raw']));
            fireEvent.click(screen.getByText('Start'));

            expectNrfmlStartCalledWithSinks('nrfml-raw-file-sink');
        });
    });
});
