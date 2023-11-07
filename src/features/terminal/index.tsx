/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Button,
    openWindow,
    selectedDevice,
    usageData,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { ipcRenderer } from 'electron';

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
            className="tw-relative tw-w-full"
            onClick={() => openSerialTerminal(selectedUartSerialPort.path)}
            title={title}
            variant="secondary"
            disabled={!appInstalled}
        >
            Open Serial Terminal
            <span
                className="mdi mdi-open-in-new tw-absolute tw-right-1"
                style={{ fontSize: '16px' }}
            />
        </Button>
    );
};

const openSerialTerminal = (serialPortPath: string) => {
    usageData.sendUsageData(EventAction.OPEN_SERIAL_TERMINAL);
    openWindow.openApp(
        { name: 'pc-nrfconnect-serial-terminal', source: 'official' },
        {
            device: {
                serialPortPath,
            },
        }
    );
};

const detectInstalledApp = async () => {
    const downloadableApps = (await ipcRenderer.invoke(
        'apps:get-downloadable-apps'
    )) as {
        apps: {
            name: string;
            source: string;
            installed?: object;
        }[];
    };

    return downloadableApps.apps.some(
        app =>
            app.source === 'official' &&
            app.name === 'pc-nrfconnect-serial-terminal' &&
            app.installed !== undefined
    );
};
