/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import {
    ConflictingSettingsDialog,
    Dropdown,
    DropdownItem,
    selectedDevice,
    SerialPort,
    truncateMiddle,
} from 'pc-nrfconnect-shared';
import { SerialPortOpenOptions } from 'serialport';

import {
    getAvailableSerialPorts,
    getShowConflictingSettingsDialog,
    getUartSerialPort,
    setShowConflictingSettingsDialog,
    setUartSerialPort,
} from '../tracing/traceSlice';
import { connectToSerialPort } from './uartSerialPort';

export default () => {
    const dispatch = useDispatch();
    const [serialPortItems, setSerialPortItems] = useState<DropdownItem[]>([]);
    const device = useSelector(selectedDevice);
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedUartSerialPort = useSelector(getUartSerialPort);
    const showConflictingSettingsDialog = useSelector(
        getShowConflictingSettingsDialog
    );
    const [selectedSerialPortItem, setSelectedSerialPortItem] =
        useState<DropdownItem | null>(null);

    const [selectedSerialPortOptions, setSelectedSerialPortOptions] = useState<
        undefined | SerialPortOpenOptions<AutoDetectTypes>
    >();

    useEffect(() => {
        const items =
            availablePorts.length > 0
                ? availablePorts.map(portPath => ({
                      label: truncateMiddle(portPath, 20, 8),
                      value: portPath,
                  }))
                : [{ label: 'Not connected', value: '' }];
        setSerialPortItems(items);

        const selectedPath = selectedUartSerialPort?.path || '';
        const selectedItem = items.find(item => item.value === selectedPath);

        if (selectedItem) {
            setSelectedSerialPortItem(selectedItem);
        }
    }, [availablePorts, selectedUartSerialPort?.path]);

    const connectToSerialPortWrapper = (path: string, overwrite = false) => {
        connectToSerialPort(dispatch, path, overwrite).then(uartSerialPort => {
            if (uartSerialPort) {
                dispatch(setUartSerialPort(uartSerialPort));
            }
        });
    };

    if (!device || !selectedSerialPortItem) {
        return null;
    }
    return (
        <>
            <Dropdown
                label="Terminal Serial Port"
                onSelect={item => {
                    if (item !== selectedSerialPortItem) {
                        setSelectedSerialPortItem(item);
                        connectToSerialPortWrapper(item.value);
                    }
                }}
                items={serialPortItems}
                selectedItem={selectedSerialPortItem}
            />

            {selectedSerialPortOptions ? (
                <ConflictingSettingsDialog
                    isVisible={showConflictingSettingsDialog}
                    localSettings={selectedSerialPortOptions}
                    onCancel={() =>
                        dispatch(setShowConflictingSettingsDialog(false))
                    }
                    onOverwrite={() => {
                        dispatch(setShowConflictingSettingsDialog(false));
                        connectToSerialPortWrapper(
                            selectedSerialPortItem.value,
                            true
                        );
                    }}
                    setSerialPortCallback={async (
                        newSerialPort: SerialPort
                    ) => {
                        dispatch(setUartSerialPort(newSerialPort));
                        const options = await newSerialPort.getOptions();
                        setSelectedSerialPortOptions(options);
                    }}
                />
            ) : null}
        </>
    );
};
