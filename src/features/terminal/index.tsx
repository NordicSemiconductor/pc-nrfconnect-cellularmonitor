/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import {
    Button,
    createSerialPort,
    Device,
    Dropdown,
    DropdownItem,
    openAppWindow,
    selectedDevice,
    truncateMiddle,
} from 'pc-nrfconnect-shared';
import type { Dispatch } from 'redux';
import { Terminal } from 'xterm-headless';

import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../shell/shellParser';
import {
    getAvailableSerialPorts,
    getUartSerialPort,
    removeShellParser,
    setShellParser,
    setUartSerialPort,
} from '../tracing/traceSlice';
import { testIfShellMode } from '../tracingEvents/at/sendCommand';

export const OpenSerialTerminal = () => {
    const dispatch = useDispatch();
    const [sources, setSources] = useState<string[]>([]);
    const [serialPortItems, setSerialPortItems] = useState<DropdownItem[]>([]);
    const device = useSelector(selectedDevice);
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedUartSerialPort = useSelector(getUartSerialPort);
    const [selectedSource, setSelectedSource] = useState<DropdownItem | null>(
        null
    );
    const [selectedSerialPortItem, setSelectedSerialPortItem] =
        useState<DropdownItem | null>(null);

    useEffect(() => {
        setSerialPortItems(
            availablePorts.length > 0
                ? [
                      ...availablePorts.map(portPath => ({
                          label: truncateMiddle(portPath, 20, 8),
                          value: portPath as string,
                      })),
                  ]
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

    useEffect(() => {
        const getSources = async () => {
            const localApps = (await ipcRenderer.invoke(
                'apps:get-local-apps'
            )) as { name: string; source: string }[];
            const localSources = localApps
                .filter(app => app.name === 'pc-nrfconnect-serial-terminal')
                .map(app => app.source);
            const { apps: downloadableApps } = (await ipcRenderer.invoke(
                'apps:get-downloadable-apps'
            )) as {
                apps: {
                    name: string;
                    source: string;
                    currentVersion: string;
                }[];
            };
            const downloadableSources = downloadableApps
                .filter(
                    app =>
                        app.name === 'pc-nrfconnect-serial-terminal' &&
                        app.currentVersion != null
                )
                .map(app => app.source);
            setSources([...localSources, ...downloadableSources]);
        };

        getSources();
    }, []);

    const sourceItems = useMemo(
        () =>
            sources.length > 0
                ? [
                      ...sources.map(source => ({
                          label: source,
                          value: source,
                      })),
                  ]
                : [{ label: 'Not Installed', value: '' }],
        [sources]
    );

    useEffect(() => {
        setSelectedSource(sourceItems[0]);
    }, [sourceItems]);

    if (device === undefined) {
        return null;
    }
    return (
        <>
            {selectedSerialPortItem !== null ? (
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
            ) : null}

            {sources.length > 1 ? (
                <Dropdown
                    label="Serial Terminal source to open"
                    selectedItem={selectedSource ?? sourceItems[0]}
                    items={sourceItems}
                    onSelect={item => setSelectedSource(item)}
                />
            ) : null}

            {selectedUartSerialPort != null ? (
                <Button
                    className="w-100 mt-2"
                    onClick={() =>
                        openSerialTerminal(
                            device,
                            selectedUartSerialPort.path,
                            selectedSource?.value ?? 'official'
                        )
                    }
                    disabled={sources.length === 0}
                    title={`Open Serial Terminal and auto connect to port ${selectedUartSerialPort.path} on device with S\\N ${device.serialNumber}`}
                    variant="secondary"
                >
                    Open Serial Terminal
                </Button>
            ) : null}
        </>
    );
};

const openSerialTerminal = (
    device: Device,
    serialPortPath: string,
    source = 'official'
) => {
    openAppWindow(
        { name: 'pc-nrfconnect-serial-terminal', source },
        {
            device: {
                serialNumber: device.serialNumber,
                serialPortPath,
            },
        }
    );
};

const connectToSerialPort = async (dispatch: Dispatch, path: string) => {
    const port = await createSerialPort({
        path,
        baudRate: 115200,
    });
    dispatch(setUartSerialPort(port));
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

    /*
     Some applications that run Line Mode have an issue, where if you power-cycle the device,
     the first AT command after the power-cycle will return an ERROR. This function `testIfShellMode`
     makes us avoid this issue, because we emit a command that will return OK if it's in shell mode, and
     ERROR if it's in line mode. Since we already got the ERROR, we won't unexpectedly get it again
     the next time we send a command.
     */
    const isShellMode = await testIfShellMode(port);

    if (isShellMode) {
        dispatch(setShellParser(shellParser));
    } else {
        dispatch(removeShellParser());
    }
};
