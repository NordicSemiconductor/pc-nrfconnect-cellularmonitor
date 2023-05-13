/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import {
    ConflictingSettingsDialog,
    createSerialPort,
    Dropdown,
    DropdownItem,
    logger,
    selectedDevice,
    SerialPort,
    truncateMiddle,
} from 'pc-nrfconnect-shared';
import type { Dispatch } from 'redux';
import { SerialPortOpenOptions } from 'serialport';
import { Terminal } from 'xterm-headless';

import { raceTimeout } from '../../utils/promise';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../shell/shellParser';
import {
    getAvailableSerialPorts,
    getShowConflictingSettingsDialog,
    getUartSerialPort,
    removeShellParser,
    setDetectedAtHostLibrary,
    setShellParser,
    setShowConflictingSettingsDialog,
    setUartSerialPort,
} from '../tracing/traceSlice';
import { testIfShellMode } from '../tracingEvents/at/sendCommand';

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
                setSelectedSerialPortOptions({
                    path: selected.value,
                    baudRate: 115200,
                });
                connectToSerialPort(dispatch, selected.value);
            }
        }
    }, [dispatch, serialPortItems, selectedUartSerialPort, device]);

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
                        connectToSerialPort(dispatch, item.value);
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
                        connectToSerialPort(
                            dispatch,
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

const connectToSerialPort = async (
    dispatch: Dispatch,
    path: string,
    overwrite = false
) => {
    let port;
    try {
        port = await createSerialPort(
            {
                path,
                baudRate: 115200,
            },
            { overwrite, settingsLocked: false }
        );
        dispatch(setUartSerialPort(port));
    } catch (error) {
        const msg = (error as Error).message;
        if (msg.includes('FAILED_DIFFERENT_SETTINGS')) {
            dispatch(setShowConflictingSettingsDialog(true));
        } else {
            logger.error(
                'Port could not be opened. Verify it is not used by some other applications'
            );
        }
    }

    if (!port) return;

    /*
         Some applications that run Line Mode have an issue, where if you power-cycle the device,
         the first AT command after the power-cycle will return an ERROR. This function `testIfShellMode`
         makes us avoid this issue, because we emit a command that will return OK if it's in shell mode, and
         ERROR if it's in line mode. Since we already got the ERROR, we won't unexpectedly get it again
         the next time we send a command.
         */
    const isShellMode = await raceTimeout(testIfShellMode(port));

    if (isShellMode === undefined) {
        dispatch(setDetectedAtHostLibrary(false));
        return;
    }

    dispatch(setDetectedAtHostLibrary(true));
    if (isShellMode) {
        const shellParser = await hookModemToShellParser(
            port,
            xTerminalShellParserWrapper(
                new Terminal({ allowProposedApi: true, cols: 999 })
            ),
            {
                shellPromptUart: 'mosh:~$',
                logRegex:
                    /[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): /,
                errorRegex: /ERROR/i,
                timeout: 10_000,
            }
        );
        dispatch(setShellParser(shellParser));
    } else {
        dispatch(removeShellParser());
    }
};
