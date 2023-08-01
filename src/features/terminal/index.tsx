/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    apps,
    Button,
    Device,
    openWindow,
    selectedDevice,
    usageData,
} from 'pc-nrfconnect-shared';

import EventAction from '../../usageDataActions';
import { getTerminalSerialPort } from './serialPortSlice';

export const OpenSerialTerminal = () => {
    const device = useSelector(selectedDevice);
    const selectedUartSerialPort = useSelector(getTerminalSerialPort);
    const [appInstalled, setAppInstalled] = useState(false);

    useEffect(() => {
        detectInstalledApp().then(setAppInstalled);
    }, []);

    if (!device || !selectedUartSerialPort) {
        return null;
    }

    const title = appInstalled
        ? `Open Serial Terminal and auto connect to port ${selectedUartSerialPort.path} on device with S\\N ${device.serialNumber}`
        : 'Serial Terminal is not installed, install it from nRF Connect For Desktop';

    return (
        <Button
            className="w-100 position-relative mt-2"
            onClick={() =>
                openSerialTerminal(device, selectedUartSerialPort.path)
            }
            title={title}
            variant="secondary"
            disabled={!appInstalled}
        >
            Open Serial Terminal
            <span
                className="mdi mdi-open-in-new"
                style={{ position: 'absolute', right: '4px', fontSize: '16px' }}
            />
        </Button>
    );
};

const openSerialTerminal = (device: Device, serialPortPath: string) => {
    usageData.sendUsageData(EventAction.OPEN_SERIAL_TERMINAL);
    openWindow.openApp(
        { name: 'pc-nrfconnect-serial-terminal', source: 'official' },
        {
            device: {
                serialNumber: device.serialNumber,
                serialPortPath,
            },
        }
    );
};

const detectInstalledApp = async () => {
    const downloadableApps = await apps.getDownloadableApps();

    return downloadableApps.apps.some(
        app =>
            app.source === 'official' &&
            app.name === 'pc-nrfconnect-serial-terminal' &&
            apps.isInstalled(app)
    );
};
