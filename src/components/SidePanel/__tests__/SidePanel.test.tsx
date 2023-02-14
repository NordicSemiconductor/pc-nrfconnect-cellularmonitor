/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-restricted-syntax */

import React from 'react';

import { TraceFormat } from '../../../features/tracing/formats';
import {
    setAvailableSerialPorts,
    setSerialPort,
} from '../../../features/tracing/traceSlice';
import * as wireshark from '../../../features/wireshark/wireshark';
import {
    expectNrfmlStartCalledWithSinks,
    fireEvent,
    getNrfmlCallbacks,
    mockedCheckDiskSpace,
    mockedCurrentPane,
    mockedDataDir,
    render,
    screen,
} from '../../../utils/testUtils';
import {
    PowerEstimationSidePanel,
    TraceCollectorSidePanel,
} from '../SidePanel';

jest.mock('../../../features/wireshark/wireshark');
jest.mock('pc-nrfconnect-shared', () => ({
    ...jest.requireActual('pc-nrfconnect-shared'),
    getAppDataDir: () => mockedDataDir,
    getAppFile: () => mockedDataDir,
    currentPane: jest.fn().mockReturnValue(0),
}));

const serialPortActions = [
    setAvailableSerialPorts(['COM1', 'COM2', 'COM3']),
    setSerialPort('COM1'),
];

const startTrace = async (...sinks: TraceFormat[]) => {
    for (const sink of sinks) {
        // eslint-disable-next-line no-await-in-loop
        fireEvent.click(await screen.findByText(sink));
    }
    fireEvent.click(screen.getByText('Start tracing'));
};

describe('Sidepanel functionality', () => {
    beforeEach(() => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        jest.clearAllMocks();
    });

    describe('DetectTraceDbDialog', () => {
        it('should show dialog while auto-detecting fw when tracing to PCAP', async () => {
            render(<TraceCollectorSidePanel />, serialPortActions);
            await startTrace('pcap');
            expect(
                screen.getByText('Detecting modem firmware version')
            ).toBeInTheDocument();
        });

        it('should not show dialog when tracing to RAW', async () => {
            render(<TraceCollectorSidePanel />, serialPortActions);
            await startTrace('raw');
            const modal = screen.queryByText(
                'Detecting modem firmware version'
            );
            expect(modal).not.toBeInTheDocument();
        });

        it('clicking Close should close dialog but not stop tracing', async () => {
            render(<TraceCollectorSidePanel />, serialPortActions);
            await startTrace('pcap');
            expect(
                screen.getByText('Detecting modem firmware version')
            ).toBeInTheDocument();
            fireEvent.click((await screen.findAllByText('Close'))[0]);
            expect(
                screen.queryByText('Detecting modem firmware version')
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

            render(<TraceCollectorSidePanel />, serialPortActions);
            await startTrace('pcap');
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
            render(<TraceCollectorSidePanel />, serialPortActions);
            await startTrace('raw', 'pcap');
            expect(
                screen.getByText('.bin', {
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
            render(<TraceCollectorSidePanel />, serialPortActions);
            await startTrace('raw');
            expect(
                screen.getByText('.bin', {
                    exact: false,
                })
            ).toBeInTheDocument();
            expect(
                screen.queryByText('.pcapng', {
                    exact: false,
                })
            ).not.toBeInTheDocument();
        });

        it('should store PCAP as .pcap', async () => {
            render(<TraceCollectorSidePanel />, serialPortActions);
            await startTrace('pcap');
            expect(
                await screen.findByText('.pcapng', {
                    exact: false,
                })
            ).toBeInTheDocument();
            expect(
                screen.queryByText('.bin', {
                    exact: false,
                })
            ).not.toBeInTheDocument();
        });
    });

    describe('Power Estimation flow', () => {
        beforeEach(() => {
            jest.spyOn(wireshark, 'findTshark').mockReturnValue(
                'path/to/tshark'
            );
        });

        test.skip.failing(
            'should update button text when tracing begins',
            async () => {
                render(
                    <>
                        <PowerEstimationSidePanel />
                        <TraceCollectorSidePanel />
                    </>,
                    serialPortActions
                );
                expect(
                    screen.getByText('Start trace to get power data...')
                ).toBeInTheDocument();
                await startTrace('raw');

                expect(
                    await screen.findByText('Waiting for power data...')
                ).toBeInTheDocument();
            }
        );

        test.skip.failing(
            'should start fetching power estimation params in the background',
            async () => {
                const callbacks = getNrfmlCallbacks();
                const waitingText = 'Start trace to get power data...';
                render(
                    <>
                        <PowerEstimationSidePanel />
                        <TraceCollectorSidePanel />
                    </>,
                    serialPortActions
                );
                expect(screen.getByText(waitingText)).toBeInTheDocument();
                await startTrace('raw');
                expectNrfmlStartCalledWithSinks(
                    'nrfml-tshark-sink',
                    'nrfml-raw-file-sink'
                );

                mockedCurrentPane.mockReturnValue(1); // Emulate PowerEstimation pane

                /*
            Currently missing a good solution to test cross-pane functionality.
            So we unfortunately have to comment out some checks, testing the transition
            between waiting for data and when we have data, because we are
            not able to re-render properly. `screen.rerender` seems to have unintended
            consequences, and unmounting and doing a new render doesn't work either.
            */

                const { jsonCallback } = await callbacks;
                // Invoke the JSON callback to test the remainder of the initial flow
                jsonCallback!([
                    {
                        onlinePowerProfiler: {
                            crdx_len: 'data',
                        },
                    },
                ]);

                expect(
                    await screen.findByText('Save power estimation data')
                ).toBeInTheDocument();
                expect(screen.queryByText(waitingText)).not.toBeInTheDocument();
            }
        );
    });
});
