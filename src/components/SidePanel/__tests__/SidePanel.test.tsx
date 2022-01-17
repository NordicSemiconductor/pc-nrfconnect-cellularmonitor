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
    expectNrfmlStartCalledWithSinks,
    fireEvent,
    getNrfmlCallbacks,
    mockedCheckDiskSpace,
    render,
} from '../../../utils/testUtils';
import {
    PowerEstimationSidePanel,
    TraceCollectorSidePanel,
} from '../SidePanel';

const serialPortActions = [
    setAvailableSerialPorts(['COM1', 'COM2', 'COM3']),
    setSerialPort('COM1'),
];

describe('Sidepanel functionality', () => {
    beforeEach(() => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        jest.clearAllMocks();
    });

    describe('DetectTraceDbDialog', () => {
        it('should show dialog while auto-detecting fw when tracing to PCAP', async () => {
            const screen = render(
                <TraceCollectorSidePanel />,
                serialPortActions
            );
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));
            expect(
                await screen.queryByText('Detecting modem firmware version')
            ).toBeInTheDocument();
        });

        it('should not show dialog when tracing to RAW', async () => {
            const screen = render(
                <TraceCollectorSidePanel />,
                serialPortActions
            );
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(screen.getByText('Start tracing'));
            const modal = screen.queryByText(
                'Detecting modem firmware version'
            );
            expect(modal).not.toBeInTheDocument();
        });

        it('clicking Close should close dialog but not stop tracing', async () => {
            const screen = render(
                <TraceCollectorSidePanel />,
                serialPortActions
            );
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));
            expect(
                await screen.queryByText('Detecting modem firmware version')
            ).toBeInTheDocument();
            fireEvent.click((await screen.findAllByText('Close'))[0]);
            expect(
                await screen.queryByText('Detecting modem firmware version')
            ).not.toBeInTheDocument();
            expect(screen.getByText('Stop tracing')).toBeInTheDocument();
        });

        it('should hide dialog when fw is detected', async () => {
            const PROGRESS = {
                meta: {
                    modem_db_path: 'foo',
                    modem_db_uuid: '123',
                },
                data_offsets: [
                    {
                        path: 'some/path',
                        offset: 1,
                    },
                ],
                duration_ms: 100,
            };

            const callbacks = getNrfmlCallbacks();

            const screen = render(
                <TraceCollectorSidePanel />,
                serialPortActions
            );
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));
            expect(
                await screen.findByText('Detecting modem firmware version')
            ).toBeInTheDocument();
            const { progressCallback } = await callbacks;
            progressCallback(PROGRESS);

            const modal = screen.queryByText(
                'Detecting modem firmware version'
            );
            expect(modal).not.toBeInTheDocument();
        });
    });

    describe('multiple sinks', () => {
        it('should show file details for multiple sinks', async () => {
            const screen = render(
                <TraceCollectorSidePanel />,
                serialPortActions
            );
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));
            expect(
                await screen.queryByText('.bin', {
                    exact: false,
                })
            ).toBeInTheDocument();
            expect(
                await screen.findByText('.pcapng', {
                    exact: false,
                })
            ).toBeInTheDocument();
        });

        it('should store RAW as .bin', async () => {
            const screen = render(
                <TraceCollectorSidePanel />,
                serialPortActions
            );
            fireEvent.click(screen.getByText('raw'));
            fireEvent.click(screen.getByText('Start tracing'));
            expect(
                await screen.queryByText('.bin', {
                    exact: false,
                })
            ).toBeInTheDocument();
            expect(
                await screen.queryByText('.pcapng', {
                    exact: false,
                })
            ).not.toBeInTheDocument();
        });

        it('should store PCAP as .pcap', async () => {
            const screen = render(
                <TraceCollectorSidePanel />,
                serialPortActions
            );
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));
            expect(
                await screen.findByText('.pcapng', {
                    exact: false,
                })
            ).toBeInTheDocument();
            expect(
                await screen.queryByText('.bin', {
                    exact: false,
                })
            ).not.toBeInTheDocument();
        });
    });

    describe('Power Estimation flow', () => {
        it('should start fetching power estimation params in the background', async () => {
            const callbacks = getNrfmlCallbacks();
            const waitingText = 'Waiting for power data...';
            const screen = render(
                <>
                    <PowerEstimationSidePanel />
                    <TraceCollectorSidePanel />
                </>,
                serialPortActions
            );
            expect(screen.getByText(waitingText)).toBeInTheDocument();
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(screen.getByText('Start tracing'));

            expectNrfmlStartCalledWithSinks(
                'nrfml-tshark-sink',
                'nrfml-raw-file-sink'
            );

            const { jsonCallback } = await callbacks;

            // Invoke the JSON callback to test the remainder of the initial flow
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await jsonCallback!([
                {
                    onlinePowerProfiler: {
                        test: 'data',
                    },
                },
            ]);
            expect(screen.queryByText(waitingText)).not.toBeInTheDocument();
            expect(
                screen.getByText('Save power estimation data')
            ).toBeInTheDocument();
        });
    });
});
