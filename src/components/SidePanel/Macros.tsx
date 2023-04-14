/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Button, SerialPort } from 'pc-nrfconnect-shared';

import { getUartSerialPort } from '../../features/tracing/traceSlice';

export const Macros = () => {
    const serialPort = useSelector(getUartSerialPort);

    if (serialPort != null) {
        return (
            <Button
                className="w-100"
                variant="secondary"
                onClick={() => sendMacros(serialPort, recommendedAt)}
                title={`Send recommended AT commands over port ${serialPort.path}.\nRemember to Start tracing, in order to update the dashboard and chart.`}
            >
                Run recommended AT commands
            </Button>
        );
    }
    return null;
};

const recommendedAt = [
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

// Todo: need to set mode in store, in order to not always check for mode
export const sendMacros = (
    serialPort: SerialPort,
    commands: string[],
    mode?: boolean
) => {
    if (mode) {
        subscribe(serialPort, '', commands);
    } else {
        testMode(serialPort, commands);
    }
};

const testMode = (serialPort: SerialPort, commands: string[]) => {
    const decoder = new TextDecoder();
    let prefix = 'at ';
    let response = '';

    const testHandler = serialPort.onData(data => {
        response += decoder.decode(data);
        const doCompare = response.endsWith('\r\n');
        if (doCompare) {
            if (response.includes('ERROR')) {
                prefix = '';
            }

            testHandler();
            subscribe(serialPort, prefix, commands);
        }
    });

    serialPort.write(`${prefix} AT\r\n`);
};

const subscribe = (
    serialPort: SerialPort,
    prefix: string,
    commands: string[]
) => {
    const decoder = new TextDecoder();
    let commandIndex = 0;
    let response = '';

    const handler = serialPort.onData(data => {
        response += decoder.decode(data);
        const doCompare = response.endsWith('\r\n');
        const doContinue =
            (doCompare && response.includes('OK')) ||
            response.includes('ERROR');
        if (doContinue) {
            commandIndex += 1;

            if (commandIndex < commands.length) {
                serialPort.write(`${prefix}${commands[commandIndex]}\r\n`);
            } else {
                // Cleanup when all commands have been sent.
                handler();
            }
            response = '';
        }
    });

    serialPort.write(`${prefix}${commands[commandIndex]}\r\n`);
};
