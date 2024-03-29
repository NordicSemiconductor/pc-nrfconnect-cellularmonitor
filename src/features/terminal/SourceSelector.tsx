/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    ConflictingSettingsDialog,
    Dropdown,
    DropdownItem,
    selectedDevice,
    SerialPort,
    truncateMiddle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';

import {
    getAvailableSerialPorts,
    getIsTracing,
    getShowConflictingSettingsDialog,
    setShowConflictingSettingsDialog,
} from '../tracing/traceSlice';
import {
    closeTerminalSerialPort,
    getTerminalSerialPort,
    setTerminalSerialPort,
} from './serialPortSlice';
import { connectToSerialPort } from './uartSerialPort';

const DESELECT_DEVICE = { label: 'Deselect', value: '' };

export default () => {
    const dispatch = useDispatch();
    const [serialPortItems, setSerialPortItems] = useState<DropdownItem[]>([]);
    const device = useSelector(selectedDevice);
    const isTracing = useSelector(getIsTracing);
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedUartSerialPort = useSelector(getTerminalSerialPort);
    const showConflictingSettingsDialog = useSelector(
        getShowConflictingSettingsDialog
    );
    const [selectedSerialPortItem, setSelectedSerialPortItem] =
        useState<DropdownItem | null>(null);

    const [selectedSerialPortOptions, setSelectedSerialPortOptions] = useState<
        undefined | SerialPortOpenOptions<AutoDetectTypes>
    >();

    useEffect(() => {
        let items: DropdownItem[] = [];
        if (availablePorts.length > 0) {
            items = availablePorts.map(portPath => ({
                label: truncateMiddle(portPath, 20, 8),
                value: portPath,
            }));
            items.push(DESELECT_DEVICE);
        } else {
            items = [{ label: 'Not connected', value: '' }];
        }
        setSerialPortItems(items);

        const selectedPath = selectedUartSerialPort?.path || '';
        const selectedItem = items.find(item => item.value === selectedPath);

        if (selectedItem) {
            setSelectedSerialPortItem(selectedItem);
        }
    }, [availablePorts, selectedUartSerialPort?.path]);

    const connectToSerialPortWrapper = (path: string, overwrite = false) => {
        if (path === '') {
            dispatch(closeTerminalSerialPort());
            return;
        }
        connectToSerialPort(dispatch, path, overwrite);
    };

    if (!device || !selectedSerialPortItem) {
        return null;
    }
    return (
        <>
            <Dropdown
                label="Terminal serial port"
                onSelect={item => {
                    if (item !== selectedSerialPortItem) {
                        setSelectedSerialPortItem(item);
                        connectToSerialPortWrapper(item.value);
                    }
                }}
                disabled={isTracing}
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
                        dispatch(setTerminalSerialPort(newSerialPort));
                        const options = await newSerialPort.getOptions();
                        setSelectedSerialPortOptions(options);
                    }}
                />
            ) : null}
        </>
    );
};
