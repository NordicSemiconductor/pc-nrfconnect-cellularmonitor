/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import {
    setPowerEstimationData,
    setSerialPort,
} from '../../features/tracing/traceSlice';
import {
    assertErrorWasLogged,
    fireEvent,
    getNrfmlCallback,
    render,
} from '../../utils/testUtils';
import PowerProfilerParams from './PowerProfilerParams';

const mockedFileName = 'mockedPowerData';

jest.mock('electron', () => ({
    remote: {
        dialog: {
            showSaveDialog: jest.fn(() => ({
                filePath: `some/path/${mockedFileName}`,
                canceled: false,
            })),
            showOpenDialogSync: jest.fn(() => [`some/path/${mockedFileName}`]),
        },
    },
}));

describe('Power profile params', () => {
    describe('with device connected', () => {
        it('should show file link after file is saved', async () => {
            const screen = render(<PowerProfilerParams />, [
                setPowerEstimationData({ test: 'data' }),
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
        it('should save file and display link', async () => {
            const nrfmlJsonPromise = getNrfmlCallback('json');

            const screen = render(<PowerProfilerParams />);
            const extractButton = await screen.findByText(
                'Get power data from RAW'
            );
            expect(extractButton).toBeInTheDocument();
            fireEvent.click(extractButton);

            const nrfmlJsonCallback = await nrfmlJsonPromise;
            nrfmlJsonCallback([
                {
                    onlinePowerProfiler: {
                        test: 'data',
                    },
                },
            ]);

            expect(
                await screen.findByText(`${mockedFileName}.json`)
            ).toBeInTheDocument();
        });

        it('should report error if jsonCB is not invoked before completedCB', async () => {
            const nrfmlCompletePromise = getNrfmlCallback('complete');
            const assertLogErrorCB = assertErrorWasLogged();

            const screen = render(<PowerProfilerParams />);
            const extractButton = await screen.findByText(
                'Get power data from RAW'
            );
            expect(extractButton).toBeInTheDocument();
            fireEvent.click(extractButton);

            const nrfmlCompleteCallback = await nrfmlCompletePromise;

            // @ts-ignore -- wrong typing
            nrfmlCompleteCallback();
            assertLogErrorCB();
        });
    });
});
