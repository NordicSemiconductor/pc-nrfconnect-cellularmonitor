/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-undef */

import React from 'react';
import { enableFetchMocks } from 'jest-fetch-mock';

import {
    setAvailableSerialPorts,
    setSerialPort,
} from '../../features/tracing/traceSlice';
import {
    assertErrorWasLogged,
    fireEvent,
    getNrfmlCallbacks,
    mockedCheckDiskSpace,
    render,
} from '../../utils/testUtils';
import {
    PowerEstimationSidePanel,
    TraceCollectorSidePanel,
} from '../SidePanel/SidePanel';
import PowerEstimation from './PowerEstimation';

enableFetchMocks();

jest.mock('plotly.js', () => ({}));

const serialPortActions = [
    setAvailableSerialPorts(['COM1', 'COM2', 'COM3']),
    setSerialPort('COM1'),
];

describe('Power Estimation pane', () => {
    beforeEach(() => {
        mockedCheckDiskSpace.mockImplementation(() => new Promise(() => {}));
        jest.clearAllMocks();
        fetchMock.resetMocks();
    });

    it('should display loading message when no data has been received', () => {
        const screen = render(<PowerEstimation />);
        expect(
            screen.getByText(
                'Start a trace to capture live power estimate or read from existing trace file'
            )
        ).toBeInTheDocument();
    });

    it('should display error message if network request fails', async () => {
        const assertLogErrorCB = assertErrorWasLogged();
        const callbacks = getNrfmlCallbacks();
        const screen = render(
            <>
                <TraceCollectorSidePanel />
                <PowerEstimationSidePanel />
                <PowerEstimation />
            </>,
            serialPortActions
        );
        fireEvent.click(await screen.findByText('raw'));
        fireEvent.click(screen.getByText('Start tracing'));
        const { jsonCallback } = await callbacks;
        fetchMock.mockRejectOnce(new Error('request failed'));
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await jsonCallback!([
            {
                onlinePowerProfiler: {
                    test: 'data',
                },
            },
        ]);
        expect(fetchMock).toHaveBeenCalled();
        expect(screen.getByText('Error!')).toBeInTheDocument();
        assertLogErrorCB();
    });

    it('should display html from response if request is ok', async () => {
        const callbacks = getNrfmlCallbacks();
        const screen = render(
            <>
                <TraceCollectorSidePanel />
                <PowerEstimationSidePanel />
                <PowerEstimation />
            </>,
            serialPortActions
        );
        fireEvent.click(await screen.findByText('raw'));
        fireEvent.click(screen.getByText('Start tracing'));

        const { jsonCallback } = await callbacks;
        fetchMock.mockResponseOnce('<h1>Request was successful</h1>');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await jsonCallback!([
            {
                onlinePowerProfiler: {
                    test: 'data',
                },
            },
        ]);
        expect(fetchMock).toHaveBeenCalled();
        expect(
            await screen.findByText('Request was successful')
        ).toBeInTheDocument();
    });
});
