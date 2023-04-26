/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    createSerialPort,
    Dropdown,
    DropdownItem,
    selectedDevice,
    truncateMiddle,
} from 'pc-nrfconnect-shared';
import type { Dispatch } from 'redux';

import {
    getAvailableSerialPorts,
    getUartSerialPort,
    setUartSerialPort,
} from '../tracing/traceSlice';

export default () => {
    const dispatch = useDispatch();
    const [serialPortItems, setSerialPortItems] = useState<DropdownItem[]>([]);
    const device = useSelector(selectedDevice);
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedUartSerialPort = useSelector(getUartSerialPort);
    const [selectedSerialPortItem, setSelectedSerialPortItem] =
        useState<DropdownItem | null>(null);

    useEffect(() => {
        setSerialPortItems(
            availablePorts.length > 0
                ? availablePorts.map(portPath => ({
                      label: truncateMiddle(portPath, 20, 8),
                      value: portPath,
                  }))
                : [{ label: 'Not connected', value: '' }]
        );
    }, [availablePorts]);

    useEffect(() => {
        if (device == null) return;
        if (serialPortItems.length > 0) {
            const selected = serialPortItems[0];

            if (selected.value !== '' && selectedUartSerialPort === null) {
                setSelectedSerialPortItem(selected);
                connectToSerialPort(dispatch, selected.value);
            }
        }
    }, [dispatch, serialPortItems, selectedUartSerialPort, device]);

    if (!device || !selectedSerialPortItem) {
        return null;
    }
    return (
        <Dropdown
            label="Terminal Serial Port"
            onSelect={item => {
                if (item !== selectedSerialPortItem) {
                    setSelectedSerialPortItem(item);
                    connectToSerialPort(dispatch, item.value);
                }
            }}
            items={serialPortItems}
            selectedItem={selectedSerialPortItem}
        />
    );
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
