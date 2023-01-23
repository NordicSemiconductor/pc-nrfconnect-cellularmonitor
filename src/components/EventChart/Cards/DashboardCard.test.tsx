/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { testUtils } from 'pc-nrfconnect-shared/test';

import dashboardReducer, {
    setDashboardState,
} from '../../../features/tracingEvents/dashboardSlice';
import { State } from '../../../features/tracingEvents/types';
import { render, screen } from '../../../utils/testUtils';
import TempCard from './Temp';

const tempFields = {
    'Trace State Operation': 'Unknown',
    'Trace State Set ID': 'Unknown',

    'LTE-M Support': 'Unknown',
    'NB-IoT Support': 'Unknown',
    'GNSS Support': 'Unknown',
    'Preferred Bearer': 'Unknown',

    'Network Status Notifications': 'Unknown',

    'Connection Evaluation Result': 'Unknown',
    'RRC State': 'Unknown',
    'Energy Estimate': 'Unknown',
    'Signal Quality (RSRP)': 255,
    'Signal Quality (RSRQ)': 255,
    'Signal Quality (SNR)': 'Unknown',
    'Cell ID': 'Unknown',
    PLMN: 'Unknown',
    'Physical Cell ID': 'Unknown',
    EARFCN: 'Unknown',
    Band: 'Unknown',
    'TAU Triggered': 'Unknown',
    'CONEVAL Cell Evaluation Level': 'Unknown',
    'CONEVAL TX Power': 'Unknown',
    'CONEVAL TX Repetitions': 'Unknown',
    'CONEVAL RX Repetitions': 'Unknown',
    'CONEVAL DL Path Loss': 'Unknown',
};

test('Temp Card displays all Keys and Value pairs', () => {
    render(<TempCard />);

    Object.entries(tempFields).forEach(([key, value]) => {
        const queriedByKey = screen.getByText(`${key}`);
        expect(queriedByKey).toBeInTheDocument();
        expect(queriedByKey.parentElement).toHaveTextContent(`${value}`);
    });

    const payload = {
        conevalResult: 0,
        rrcState: 1,
        conevalEnergyEstimate: 5,
        signalQuality: {
            rsrp: 8,
            rsrq: 2,
            snr: 14,
        },
        cellID: '011B0780',
        plmn: '26295',
        physicalCellID: 7,
        earfcn: 1575,
        band: 3,
        TAUTriggered: 1,
        conevalCellEvaluationLevel: 1,
        conevalTXPower: 23,
        conevalTXRepetitions: 16,
        conevalRXRepetitions: 32,
        conevalDLPathLoss: 130,
    };

    const updateState = setDashboardState(payload as State);

    testUtils.dispatchTo(dashboardReducer, [updateState]);

    render(<TempCard />);
    // expect(queriedByKey).toBeEqual(queriedByValue);
    Object.entries(tempFields).forEach(([key, value]) => {
        screen.findByText(`${key}`).then(element => {
            expect(element).toBeInTheDocument();
            expect(element.parentElement).not.toHaveTextContent(`${value}`);
        });
    });
});
