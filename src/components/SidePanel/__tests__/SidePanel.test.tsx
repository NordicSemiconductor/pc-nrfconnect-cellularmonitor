/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
// eslint-disable-next-line import/no-unresolved
import { Configuration } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';

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

    describe('DetectTraceDbDialog', () => {
        it('should show dialog while auto-detecting fw when tracing to PCAP', async () => {
            const screen = render(<SidePanel />, serialPortActions);
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));
            expect(
                await screen.queryByText('Detecting modem firmware version')
            ).toBeInTheDocument();
        });

        it('should not show dialog when tracing to RAW', async () => {
            const screen = render(<SidePanel />, serialPortActions);
            fireEvent.click(await screen.findByText('raw'));
            fireEvent.click(screen.getByText('Start tracing'));
            const modal = screen.queryByText(
                'Detecting modem firmware version'
            );
            expect(modal).not.toBeInTheDocument();
        });

        it('clicking Close should close dialog but not stop tracing', async () => {
            const screen = render(<SidePanel />, serialPortActions);
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
            let callback: nrfml.ProgressCallback;
            const progress = {
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

            // @ts-ignore -- ts doesn't understand that nrfml.start is a mock fn
            await nrfml.start.mockImplementationOnce(
                (
                    config: Configuration,
                    errCb: nrfml.CompleteCallback,
                    progressCb: nrfml.ProgressCallback
                ) => {
                    callback = progressCb;
                }
            );

            const screen = render(<SidePanel />, serialPortActions);
            fireEvent.click(await screen.findByText('pcap'));
            fireEvent.click(screen.getByText('Start tracing'));
            expect(
                await screen.findByText('Detecting modem firmware version')
            ).toBeInTheDocument();

            // @ts-ignore -- ts wrongly complains that callback is used before it is assigned which is wrong
            callback(progress);

            const modal = screen.queryByText(
                'Detecting modem firmware version'
            );
            expect(modal).not.toBeInTheDocument();
        });
    });
});
