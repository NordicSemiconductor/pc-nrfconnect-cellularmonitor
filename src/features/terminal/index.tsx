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
    CollapsibleGroup,
    createSerialPort,
    Device,
    Dropdown,
    DropdownItem,
    openAppWindow,
    selectedDevice,
    truncateMiddle,
} from 'pc-nrfconnect-shared';
import type { Dispatch } from 'redux';

import {
    getAvailableSerialPorts,
    getUartSerialPort,
    setUartSerialPort,
} from '../tracing/traceSlice';

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
        <CollapsibleGroup heading="Serial Terminal">
            {selectedSerialPortItem !== null ? (
                <Dropdown
                    label="Port"
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
                    large
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
        </CollapsibleGroup>
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
    dispatch(
        setUartSerialPort(
            await createSerialPort({
                path,
                baudRate: 115200,
            })
        )
    );
};
