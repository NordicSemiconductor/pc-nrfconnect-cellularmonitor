/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { enableFetchMocks } from 'jest-fetch-mock';

import { TraceFormat } from '../../../features/tracing/formats';
import {
    setAvailableSerialPorts,
    setSerialPort,
    setTraceFormats,
} from '../../../features/tracing/traceSlice';
import {
    fireEvent,
    getNrfmlCallbacks,
    mockedCheckDiskSpace,
    mockedDataDir,
    render,
    screen,
} from '../../../utils/testUtils';
import { TraceCollectorSidePanel } from '../SidePanel';

enableFetchMocks();

jest.mock('../../../features/wireshark/wireshark');
jest.mock('pc-nrfconnect-shared', () => ({
    ...jest.requireActual('pc-nrfconnect-shared'),
    getAppDataDir: () => mockedDataDir,
    getAppDir: () => mockedDataDir,
    getAppFile: () => mockedDataDir,
    currentPane: jest.fn().mockReturnValue(0),
    createSerialPort: () => ({
        path: '/dev/ROBOT',
    }),
}));

jest.mock('electron', () => ({
    ...jest.requireActual('electron'),
    ipcRenderer: {
        invoke: (channel: string) => {
            if (channel === 'apps:get-downloadable-apps') {
                return {
                    apps: [
                        {
                            name: 'pc-nrfconnect-serial-terminal',
                            source: 'official',
                            currentVersion: 'v1.0.0',
                        },
                    ],
                };
            }
            if (channel === 'apps:get-local-apps') {
                return [
                    {
                        name: 'pc-nrfconnect-serial-terminal',
                        source: 'local',
                    },
                ];
            }
            return 'Unexpected IPC Channel used in test';
        },
    },
}));

const serialPortActions = (formats: TraceFormat[] = []) => [
    setAvailableSerialPorts(['COM1', 'COM2', 'COM3']),
    setSerialPort('COM1'),
    setTraceFormats(formats),
];

const startTrace = () => fireEvent.click(screen.getByText('Start'));

describe('Sidepanel functionality', () => {
    beforeEach(() => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        jest.clearAllMocks();
    });

    describe('DetectTraceDbDialog', () => {
        it('should show dialog while auto-detecting fw when tracing to PCAP', async () => {
            render(<TraceCollectorSidePanel />, serialPortActions(['pcap']));
            startTrace();

            await expect(
                screen.findByText('Detecting modem firmware version')
            ).resolves.toBeDefined();
        });

        it('should not show dialog when tracing to RAW', async () => {
            render(<TraceCollectorSidePanel />, serialPortActions(['raw']));

            startTrace();

            await expect(
                screen.findByText('Detecting modem firmware version')
            ).rejects.toBeDefined();
        });

        it('clicking Close should close dialog but not stop tracing', async () => {
            render(<TraceCollectorSidePanel />, serialPortActions(['pcap']));
            startTrace();
            expect(
                screen.getByText('Detecting modem firmware version')
            ).toBeInTheDocument();
            fireEvent.click((await screen.findAllByText('Close'))[0]);
            expect(
                screen.queryByText('Detecting modem firmware version')
            ).not.toBeInTheDocument();
            expect(screen.getByText('Stop')).toBeInTheDocument();
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

            render(<TraceCollectorSidePanel />, serialPortActions(['pcap']));
            startTrace();
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
            render(
                <TraceCollectorSidePanel />,
                serialPortActions(['pcap', 'raw'])
            );
            startTrace();
            expect(
                screen.getByText('.mtrace', {
                    exact: false,
                })
            ).toBeInTheDocument();
            expect(
                await screen.findByText('.pcapng', {
                    exact: false,
                })
            ).toBeInTheDocument();
        });
    });
});
