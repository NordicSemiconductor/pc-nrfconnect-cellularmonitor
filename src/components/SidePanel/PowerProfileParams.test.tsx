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
    setPowerEstimationData,
    setSerialPort,
} from '../../features/tracing/traceSlice';
import { fireEvent, render } from '../../utils/testUtils';
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
            let callback: nrfml.JsonCallback;
            // @ts-ignore -- ts doesn't understand that nrfml.start is a mock fn
            await nrfml.start.mockImplementationOnce(
                (
                    config: Configuration,
                    errCb: nrfml.CompleteCallback,
                    progressCb: nrfml.ProgressCallback,
                    dataCb: nrfml.DataCallback,
                    jsonCb: nrfml.JsonCallback
                ) => {
                    callback = jsonCb;
                }
            );
            const screen = render(<PowerProfilerParams />);
            const extractButton = await screen.findByText(
                'Get power data from RAW'
            );
            expect(extractButton).toBeInTheDocument();
            fireEvent.click(extractButton);

            // @ts-ignore -- ts wrongly complains that callback is used before it is assigned which is wrong
            callback([
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
    });
});
