/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import {
    Dropdown,
    DropdownItem,
    Group,
    SidePanel,
    truncateMiddle,
} from 'pc-nrfconnect-shared';

import { createModem } from '../../features/terminal/modem';
import {
    getModem,
    getPopoutId,
    getSelectedSerialport,
    setModem,
    setSelectedSerialport,
} from '../../features/terminal/terminalSlice';
import {
    getAvailableSerialPorts,
    getSerialPort,
    getTaskId,
} from '../../features/tracing/traceSlice';

const TerminalSidePanel = () => {
    const availablePorts = useSelector(getAvailableSerialPorts);
    const modem = useSelector(getModem);
    const selectedSerialport = useSelector(getSelectedSerialport);
    const popoutId = useSelector(getPopoutId);
    const taskId = useSelector(getTaskId);
    const tracePort = useSelector(getSerialPort);
    const dispatch = useDispatch();

    const updateSerialPort = ({ value: portPath }: { value: string }) => {
        if (portPath !== selectedSerialport) {
            if (modem) modem?.close();

            if (portPath !== 'Not connected')
                dispatch(setModem(createModem(portPath)));
            else setModem(undefined);
        }

        dispatch(setSelectedSerialport(portPath));
    };

    useEffect(() => {
        ipcRenderer.on('terminal-serialport', (_, data) =>
            updateSerialPort(data)
        );
    });

    const dropdownItems = useMemo<DropdownItem[]>(() => {
        if (availablePorts.length > 0)
            return [
                { label: 'Not connected', value: 'Not connected' },
                ...availablePorts
                    .filter(portPath => !(taskId && portPath === tracePort))
                    .map(portPath => ({
                        label: truncateMiddle(portPath, 20, 8),
                        value: portPath as string,
                    })),
            ] as DropdownItem[];
        return [];
    }, [availablePorts, taskId, tracePort]);

    useEffect(() => {
        if (popoutId)
            ipcRenderer.sendTo(popoutId, 'terminal-serialport', {
                dropdownItems,
                selectedSerialport,
            });
    }, [popoutId, dropdownItems, selectedSerialport]);

    return (
        <SidePanel className="side-panel">
            {!popoutId && availablePorts?.length > 0 && (
                <Group heading="Serialport trace capture">
                    <Dropdown
                        onSelect={updateSerialPort}
                        items={dropdownItems}
                        defaultIndex={
                            selectedSerialport
                                ? dropdownItems.findIndex(
                                      e => e.value === selectedSerialport
                                  )
                                : 0
                        }
                    />
                </Group>
            )}
        </SidePanel>
    );
};

export default TerminalSidePanel;
