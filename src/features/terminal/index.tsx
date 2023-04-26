/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
    Button,
    Device,
    openAppWindow,
    selectedDevice,
} from 'pc-nrfconnect-shared';

import { getUartSerialPort } from '../tracing/traceSlice';

export const OpenSerialTerminal = () => {
    const device = useSelector(selectedDevice);
    const selectedUartSerialPort = useSelector(getUartSerialPort);

    if (!device || !selectedUartSerialPort) {
        return null;
    }

    return (
        <Button
            className="w-100 mt-2"
            onClick={() =>
                openSerialTerminal(device, selectedUartSerialPort.path)
            }
            title={`Open Serial Terminal and auto connect to port ${selectedUartSerialPort.path} on device with S\\N ${device.serialNumber}`}
            variant="secondary"
        >
            Open Serial Terminal
        </Button>
    );
};

const openSerialTerminal = (device: Device, serialPortPath: string) => {
    openAppWindow(
        { name: 'pc-nrfconnect-serial-terminal', source: 'official' },
        {
            device: {
                serialNumber: device.serialNumber,
                serialPortPath,
            },
        }
    );
};
