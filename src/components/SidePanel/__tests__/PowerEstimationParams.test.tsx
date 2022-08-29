/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { setData as setPowerEstimationData } from '../../../features/powerEstimation/powerEstimationSlice';
import { setSerialPort } from '../../../features/tracing/traceSlice';
import * as wireshark from '../../../features/wireshark/wireshark';
import {
    assertErrorWasLogged,
    fireEvent,
    getNrfmlCallbacks,
    render,
    screen,
} from '../../../utils/testUtils';
import PowerEstimationParams from '../PowerEstimationParams';

jest.mock('../../../features/wireshark/wireshark');
const mockedFileName = 'mockedPowerData';

jest.mock('@electron/remote', () => ({
    dialog: {
        showSaveDialog: jest.fn(() => ({
            filePath: `some/path/${mockedFileName}`,
            canceled: false,
        })),
        showOpenDialogSync: jest.fn(() => [`some/path/${mockedFileName}`]),
    },
    getCurrentWindow: () => ({
        getTitle: () => 'Title',
    }),
}));

describe('Power profile params', () => {
    beforeEach(() => {
        jest.spyOn(wireshark, 'findTshark').mockReturnValue('path/to/tshark');
    });

    describe('with device connected', () => {
        it('shows file link after file is saved', async () => {
            render(<PowerEstimationParams />, [
                setPowerEstimationData({ cdrx_len: 'data' }),
                setSerialPort('COM1'),
            ]);
            const saveButton = await screen.findByText(
                'Save power estimation data'
            );
            expect(saveButton).toBeInTheDocument();
            fireEvent.click(saveButton);
            expect(await screen.findByText(mockedFileName)).toBeInTheDocument();
        });
    });

    describe('without device connected', () => {
        it('shows file link after file is saved', async () => {
            const callbacks = getNrfmlCallbacks();
            render(<PowerEstimationParams />);
            const extractButton = await screen.findByText(
                'Get power data from RAW'
            );
            fireEvent.click(extractButton);

            const { jsonCallback } = await callbacks;
            jsonCallback!([
                {
                    onlinePowerProfiler: {
                        test: 'data',
                    },
                },
            ]);

            const saveButton = await screen.findByText(
                'Save power estimation data'
            );
            expect(saveButton).toBeInTheDocument();
            fireEvent.click(saveButton);
            expect(await screen.findByText(mockedFileName)).toBeInTheDocument();
        });

        it('should report error if jsonCB is not invoked before completedCB', async () => {
            const callbacks = getNrfmlCallbacks();
            const assertLogErrorCB = assertErrorWasLogged();

            render(<PowerEstimationParams />);
            const extractButton = await screen.findByText(
                'Get power data from RAW'
            );
            fireEvent.click(extractButton);

            const { completeCallback } = await callbacks;

            completeCallback();
            assertLogErrorCB();
        });

        it('should indicate loading state', async () => {
            const callbacks = getNrfmlCallbacks();

            render(<PowerEstimationParams />);
            const extractButton = await screen.findByText(
                'Get power data from RAW'
            );
            fireEvent.click(extractButton);
            expect(screen.getByText('Fetching data...')).toBeInTheDocument();

            const { completeCallback } = await callbacks;

            completeCallback();
            expect(
                screen.queryByText('Fetching data...')
            ).not.toBeInTheDocument();
        });
    });
});
