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
import { fireEvent, render } from '../../utils/testUtils';
import PowerProfilerParams from './PowerProfilerParams';

const mockedFileName = 'mockedPowerData.json';

jest.mock('electron', () => ({
    remote: {
        dialog: {
            showSaveDialog: jest.fn(() => ({
                filePath: `some/path/${mockedFileName}`,
                canceled: false,
            })),
        },
    },
}));

describe('Power profile params', () => {
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
