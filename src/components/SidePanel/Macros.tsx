import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
    createSerialPort,
    selectedDevice,
    SerialPort,
} from 'pc-nrfconnect-shared';

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
        return (
            <CollapsibleGroup heading="Macros" defaultCollapsed={false}>
                <Button
                    large
                    className="btn-secondary w-100"
                    onClick={() => connectToSerialPort(dispatch, path!)}
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

const connectToSerialPort = async (dispatch, path: string) => {
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
    // 'AT+CNEC=24',
    'AT+CFUN=1\r\n',
    'AT+CMEE=1\r\n',
    'AT+CEER\r\n',
    'AT%MDMEV=1\r\n',
    'AT+CEREG=5\r\n',
    'AT%CESQ=1\r\n',
    'AT+CGEREP=1\r\n',
    'AT%XTIME=1\r\n',
    'AT+CSCON=1\r\n',
    'AT%XSIM=1\r\n',
    'AT%XPOFWARN=\r\n',
    'AT%XVBATLVL=\r\n',
];

const subscribe = (serialPort: SerialPort) => {
    const decoder = new TextDecoder();
    let commandIndex = 0;
    let response = '';
    serialPort.onData(data => {
        response += decoder.decode(data);
        const doCompare = response.endsWith('\r\n');
        console.log(`Buffer=${response} && doCompare=${doCompare}`);
        const doContinue =
            (doCompare && response.includes('OK')) ||
            response.includes('ERROR');
        console.log(
            `On cmd=${notifications[commandIndex]}, we recieved = ${response}, hence doContinue = ${doContinue}`
        );
        if (doContinue) {
            commandIndex += 1;

            if (commandIndex < notifications.length) {
                serialPort.write(notifications[commandIndex]);
            }
            response = '';
        }
    });

    serialPort.write(notifications[commandIndex]);
};
