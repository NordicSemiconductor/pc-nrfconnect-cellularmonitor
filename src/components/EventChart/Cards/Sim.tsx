/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { ATCommands } from '../../../features/tracingEvents/at';
import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

export default () => {
    const {
        iccid,
        imsi,
        manufacturer,
        operatorFullName,
        pinCodeStatus: pin,
        pinRetries: {
            SIM_PIN: remainingPIN,
            SIM_PUK: remainingPUK,
            SIM_PIN2: remainingPIN2,
            SIM_PUK2: remainingPUK2,
        },
    } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        IMSI: {
            value: imsi ?? 'Unknown',
            commands: ['AT+CIMI'] as ATCommands[],
        },
        OPERATOR: {
            value: operatorFullName ?? 'Unknown',
            commands: ['AT%XMONITOR'] as ATCommands[],
        },
        MANUFACTURER: {
            value: manufacturer ?? 'Unknown',
            commands: ['AT+CGMI'] as ATCommands[] as ATCommands[],
        },
        ICCID: {
            value: iccid ?? 'Unknown',
            commands: ['AT%XICCID'] as ATCommands[],
        },
        PIN: { value: pin, commands: ['AT+CPIN'] as ATCommands[] },
        'PIN RETRIED': {
            value: remainingPIN ?? 'Unknown',
            commands: ['AT+CPINR'] as ATCommands[],
        },
        'PUK RETRIED': {
            value: remainingPUK ?? 'Unknown',
            commands: ['AT+CPINR'] as ATCommands[],
        },
        'PIN2 RETRIED': {
            value: remainingPIN2 ?? 'Unknown',
            commands: ['AT+CPINR'] as ATCommands[],
        },
        'PUK2 RETRIED': {
            value: remainingPUK2 ?? 'Unknown',
            commands: ['AT+CPINR'] as ATCommands[],
        },
        'LTE-M': { value: 'NOT IMPLEMENTED', commands: [] },
        'NB-IoT': { value: 'NOT IMPLEMENTED', commands: [] },
        IPV4: { value: 'NOT IMPLEMENTED', commands: [] },
        IPV6: { value: 'NOT IMPLEMENTED', commands: [] },
        'NON-IP': { value: 'NOT IMPLEMENTED', commands: [] },
        PSM: { value: 'NOT IMPLEMENTED', commands: [] },
        CDRX: { value: 'NOT IMPLEMENTED', commands: [] },
        EDRX: { value: 'NOT IMPLEMENTED', commands: [] },
        RAI: { value: 'NOT IMPLEMENTED', commands: [] },
        'AS-RAI': { value: 'NOT IMPLEMENTED', commands: [] },
        'CP-RAI': { value: 'NOT IMPLEMENTED', commands: [] },
        NETWORK: { value: 'NOT IMPLEMENTED', commands: [] },
        ISSUER: { value: 'NOT IMPLEMENTED', commands: [] },
    };

    return <DashboardCard title="Sim" iconName="mdi-sim" fields={fields} />;
};
