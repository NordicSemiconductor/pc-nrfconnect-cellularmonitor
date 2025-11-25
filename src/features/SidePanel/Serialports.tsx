/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dropdown,
    selectedDevice,
    truncateMiddle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { setSerialPort as persistSerialPort } from '../../app/store';
import {
    getAvailableSerialPorts,
    getIsTracing,
    getTraceSerialPort,
    setTraceSerialPort,
} from '../tracing/traceSlice';

export default () => {
    const dispatch = useDispatch();
    const availablePorts = useSelector(getAvailableSerialPorts);
    // TODO: verify if this is needed
    const serialNumber = useSelector(selectedDevice)?.serialNumber ?? '';
    const selectedSerialPort = useSelector(getTraceSerialPort);
    const isTracing = useSelector(getIsTracing);

    const updateSerialPort = ({ value: port }: { value: string }) => {
        dispatch(setTraceSerialPort(port));
        persistSerialPort(serialNumber, port);
    };

    const dropdownItems = availablePorts.map(port => ({
        label: truncateMiddle(port, 20, 8),
        value: port as string,
    }));

    const selectedItem = dropdownItems.find(
        item => item.value === selectedSerialPort,
    ) ?? { label: '', value: '' };

    if (selectedSerialPort == null) return null;

    return (
        <div className="serialport-selection">
            <Dropdown
                label="Modem trace serial port"
                disabled={isTracing}
                onSelect={updateSerialPort}
                selectedItem={selectedItem}
                items={dropdownItems}
            />
        </div>
    );
};
