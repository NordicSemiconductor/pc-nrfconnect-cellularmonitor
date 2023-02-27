/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
    createSerialPort,
    selectedDevice,
    SerialPort,
} from 'pc-nrfconnect-shared';
import { Dispatch } from 'redux';

import {
    getUartSerialPort,
    setUartSerialPort,
} from '../../features/modem/modemSlice';

export const Macros = () => {
    const dispatch = useDispatch();
    const device = useSelector(selectedDevice);
    const serialPort = useSelector(getUartSerialPort);

    if (device != null && serialPort === null) {
        const ports = device.serialPorts;
        const port = ports != null ? ports[0] : undefined;
        if (port == null) return;
        const portName =
            port != null ? port.comName ?? `Port #${port.vcom}` : 'Unknown';
        const path = port.path;

        if (path == null) {
            return null;
        }

        return (
            <CollapsibleGroup heading="Macros" defaultCollapsed={false}>
                <Button
                    large
                    className="btn-secondary w-100"
                    onClick={() => connectToSerialPort(dispatch, path)}
                >
                    Connect to port ${portName}
                </Button>
            </CollapsibleGroup>
        );
    }

    if (serialPort != null) {
        return (
            <CollapsibleGroup heading="Macros" defaultCollapsed={false}>
                <p>Connected to {serialPort.path}</p>
                <Button
                    large
                    className="btn-secondary w-100"
                    onClick={() => subscribe(serialPort)}
                >
                    Subscribe to notifications
                </Button>
            </CollapsibleGroup>
        );
    }
    return null;
};

const connectToSerialPort = async (dispatch: Dispatch, path: string) => {
    dispatch(
        setUartSerialPort(
            await createSerialPort({
                path,
                baudRate: 115200,
            })
        )
    );
};

const notifications = [
    'AT+CFUN=1',
    'AT+CGSN=1',
    'AT+CGMI',
    'AT+CGMM',
    'AT+CGMR',
    'AT+CEMODE?',
    'AT%XCBAND=?',
    'AT+CMEE?',
    'AT+CNEC?',
    'AT+CGEREP?',
    'AT+CIND=1,1,1',
    'AT+CEREG=5',
    'AT+CEREG?',
    'AT+COPS=3,2',
    'AT+COPS?',
    'AT%XCBAND',
    'AT+CGDCONT?',
    'AT+CGACT?',
    'AT%CESQ=1',
    'AT+CESQ',
    'AT%XSIM=1',
    'AT%XSIM?',
    'AT+CPIN?',
    'AT+CPINR="SIM PIN"',
    'AT+CIMI',
    'AT+CNEC=24',
    'AT+CMEE=1',
    'AT+CEER',
    'AT%MDMEV=1',
    'AT%CESQ=1',
    'AT+CGEREP=1',
    'AT%XTIME=1',
    'AT+CSCON=1',
    'AT%XPOFWARN=1,30',
    'AT%XVBATLVL=1',
    'AT%XMONITOR',
    'AT%CONEVAL',
    'AT%XCONNSTAT=1',
    'AT#XPING="www.google.com",45,5000,5,1000',
    'AT%XCONNSTAT?',
    'AT%HWVERSION',
    'AT%XMODEMUUID',
    'AT%XDATAPRFL?',
    'AT%XSYSTEMMODE?',
];

const subscribe = (serialPort: SerialPort) => {
    const decoder = new TextDecoder();
    let commandIndex = 0;
    let response = '';
    serialPort.onData(data => {
        response += decoder.decode(data);
        const doCompare = response.endsWith('\r\n');
        const doContinue =
            (doCompare && response.includes('OK')) ||
            response.includes('ERROR');
        if (doContinue) {
            commandIndex += 1;

            if (commandIndex < notifications.length) {
                serialPort.write(`${notifications[commandIndex]}\r\n`);
            }
            response = '';
        }
    });

    serialPort.write(`${notifications[commandIndex]}\r\n`);
};
