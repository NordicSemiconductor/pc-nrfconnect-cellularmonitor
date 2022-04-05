/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Dropdown,
    DropdownItem,
    Group,
    SidePanel,
    truncateMiddle,
} from 'pc-nrfconnect-shared';

import { createModem, Modem } from '../../features/modem/modem';
import { getAvailableSerialPorts } from '../../features/tracing/traceSlice';

const TerminalSidePanel = () => {
    const availablePorts = useSelector(getAvailableSerialPorts);
    const [modem, setModem] = useState<Modem>();
    const [selectedSerialport, setSelectedSerialport] = useState<string>();

    const updateSerialPort = ({ value: portPath }: { value: string }) => {
        if (portPath !== selectedSerialport) {
            if (!modem) return;

            modem?.close();
            setModem(createModem(portPath));
        }

        setSelectedSerialport(portPath);
    };

    const dropdownItems = useMemo<DropdownItem[]>(() => {
        if (availablePorts.length > 0)
            return [
                { label: 'Not connected', value: undefined },
                ...availablePorts.map(portPath => ({
                    label: truncateMiddle(portPath, 20, 8),
                    value: portPath as string,
                })),
            ] as DropdownItem[];
        return [];
    }, [availablePorts]);

    return (
        <SidePanel className="side-panel">
            {availablePorts?.length > 0 && (
                <Group heading="Serialport trace capture">
                    <Dropdown
                        onSelect={updateSerialPort}
                        items={dropdownItems}
                    />
                </Group>
            )}
        </SidePanel>
    );
};

export default TerminalSidePanel;
