/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import {
    fireEvent,
    mockedCheckDiskSpace,
    mockedDataDir,
    render,
    screen,
} from '../../../utils/testUtils';
import { TraceCollectorSidePanel } from '../SidePanel';
import TraceFormatSelector from '../Tracing/TraceFormatSelector';

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

describe('Sidepanel functionality', () => {
    beforeEach(() => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        jest.clearAllMocks();
    });

    describe('multiple sinks', () => {
        xit('should show file details for multiple sinks', async () => {
            render(<TraceFormatSelector />);

            fireEvent.click(await screen.findByText('raw'));

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

        xit('should store RAW as .bin', async () => {
            // render(<TraceCollectorSidePanel />, serialPortActions);
            // await startTrace('raw');
            // expect(
            //     screen.getByText('.bin', {
            //         exact: false,
            //     })
            // ).toBeInTheDocument();
            // expect(
            //     screen.queryByText('.pcapng', {
            //         exact: false,
            //     })
            // ).not.toBeInTheDocument();
        });

        xit('should store PCAP as .pcap', async () => {
            // render(<TraceCollectorSidePanel />, serialPortActions);
            // await startTrace('pcap');
            // expect(
            //     await screen.findByText('.pcapng', {
            //         exact: false,
            //     })
            // ).toBeInTheDocument();
            // expect(
            //     screen.queryByText('.bin', {
            //         exact: false,
            //     })
            // ).not.toBeInTheDocument();
        });
    });
});
