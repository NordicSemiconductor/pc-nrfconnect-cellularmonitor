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
import SidePanel from '../SidePanel';

const serialPortActions = [
    setAvailableSerialPorts(['COM1', 'COM2', 'COM3']),
    setSerialPort('COM1'),
];

describe('Sidepanel functionality', () => {
    beforeEach(() => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
    });

    it('should store RAW as .bin', async () => {
        const screen = render(<SidePanel />, serialPortActions);
        fireEvent.click(screen.getByText('raw'));
        fireEvent.click(screen.getByText('Start tracing'));
        expect(
            await screen.findByText('.bin', {
                exact: false,
            })
        ).toBeInTheDocument();
    });

    it('should store PCAP as .pcap', async () => {
        const screen = render(<SidePanel />, serialPortActions);
        fireEvent.click(await screen.findByText('pcap'));
        fireEvent.click(screen.getByText('Start tracing'));
        expect(
            await screen.findByText('.pcapng', {
                exact: false,
            })
        ).toBeInTheDocument();
    });
});
