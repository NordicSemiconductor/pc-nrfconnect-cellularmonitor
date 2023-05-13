/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, truncateMiddle } from 'pc-nrfconnect-shared';

import {
    getAvailableSerialPorts,
    getIsTracing,
    getSelectedSerialNumber,
    getSerialPort,
    setSerialPort,
} from '../../features/tracing/traceSlice';
import { setSerialPort as persistSerialPort } from '../../utils/store';

export default () => {
    const dispatch = useDispatch();
    const availablePorts = useSelector(getAvailableSerialPorts);
    const serialNumber = useSelector(getSelectedSerialNumber) ?? '';
    const selectedSerialPort = useSelector(getSerialPort);
    const isTracing = useSelector(getIsTracing);

    const updateSerialPort = ({ value: port }: { value: string }) => {
        dispatch(setSerialPort(port));
        persistSerialPort(serialNumber, port);
    };

    const dropdownItems = availablePorts.map(port => ({
        label: truncateMiddle(port, 20, 8),
        value: port as string,
    }));

    const selectedItem = dropdownItems.find(
        item => item.value === selectedSerialPort
    ) ?? { label: '', value: '' };

    if (selectedSerialPort == null) return null;

    return (
        <div className="serialport-selection">
            <Dropdown
                label="Serial port trace capture"
                disabled={isTracing}
                onSelect={updateSerialPort}
                selectedItem={selectedItem}
                items={dropdownItems}
            />
        </div>
    );
};
