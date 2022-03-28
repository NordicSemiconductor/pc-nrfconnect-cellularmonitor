/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import {
    Dropdown,
    getAppDir,
    Group,
    logger,
    SidePanel,
    truncateMiddle,
} from 'pc-nrfconnect-shared';

import { TERMINAL_OUTPUT } from '../../../terminal-light/sample-output';
import { createModem, Modem, Response } from '../../features/modem/modem';
import { getAvailableSerialPorts } from '../../features/tracing/traceSlice';

const appDir = getAppDir();

const loadMainBundle = async () => {
    if (await ipcRenderer.invoke('require', `${appDir}/dist/main-bundle`)) {
        logger.info('Successfully loaded main bundle');
    }
};

const openTerminal = () => {
    ipcRenderer.send('open-app', {
        name: 'pc-nrfconnect-cellularmonitor-terminal',
        currentVersion: '1.0.0',
        path: `${appDir}/terminal`,
    });
};

let terminalWindowId: number;

const openTerminalLight = async () => {
    const url = `file://${appDir}/terminal-light/index.html`;
    terminalWindowId = await ipcRenderer.invoke('open-app-light2', url);
};

const sendTerminalData = () => {
    let delay = 0;
    TERMINAL_OUTPUT.forEach(line => {
        delay += Math.floor(Math.random() * 200 + 50);
        setTimeout(() => {
            ipcRenderer.sendTo(terminalWindowId, 'terminal-data', line);
        }, delay);
    });
};

export const TerminalSidePanel = () => {
    const availablePorts = useSelector(getAvailableSerialPorts);
    const [modem, setModem] = useState<Modem>();
    const [port, setPort] = useState<MessagePort>();
    const [selectedSerialport, setSelectedSerialport] = useState<string>();

    const writeln = useCallback(
        (prompt: string) => {
            if (port) port?.postMessage(prompt);
            else if (terminalWindowId)
                ipcRenderer.sendTo(terminalWindowId, 'terminal-data', prompt);
        },
        [port]
    );

    const handleModemResponse = useCallback(
        (lines: Response) => {
            lines.forEach(l => {
                writeln(l);
            });
        },
        [writeln]
    );

    useEffect(() => {
        if (!modem) return;

        const unregisterOnLine = modem.onLine(line => writeln(line));
        const unregisterOnResponse = modem.onResponse(handleModemResponse);

        return () => {
            if (!modem) return;

            unregisterOnLine();
            unregisterOnResponse();
        };
    }, [modem, writeln, handleModemResponse]);

    useEffect(() => {
        if (availablePorts?.length > 0 && !selectedSerialport) {
            setSelectedSerialport(availablePorts[0]);
            setModem(createModem(availablePorts[0]));
        } else if (availablePorts.length === 0 && selectedSerialport) {
            setSelectedSerialport(undefined);
            modem?.close();
            setModem(undefined);
        } else if (!modem && port)
            port?.postMessage('Open a device to activate the terminal.');
        else if (!modem && terminalWindowId)
            ipcRenderer.sendTo(
                terminalWindowId,
                'terminal-data',
                'Open a device to activate the terminal.'
            );
    }, [modem, availablePorts, selectedSerialport, port]);

    useEffect(() => {
        if (!port) return;

        port.onmessage = e => {
            if (!modem) {
                if (port)
                    port.postMessage('Open a device to activate the terminal.');
                else if (terminalWindowId)
                    ipcRenderer.sendTo(
                        terminalWindowId,
                        'terminal-data',
                        'Open a device to activate the terminal.'
                    );
            } else if (!modem?.write(e.data))
                if (port)
                    port.postMessage(
                        'Command rejected while processing previous command'
                    );
                else if (terminalWindowId)
                    ipcRenderer.sendTo(
                        terminalWindowId,
                        'terminal-data',
                        'Command rejected while processing previous command'
                    );
        };
    }, [port, modem]);

    useEffect(() => {
        ipcRenderer.on('new-window-port', event => {
            const [messagePort] = event.ports;

            messagePort.addEventListener('close', () => {
                console.log('MessagePort onClose');
                messagePort.close();
                setPort(undefined);
            });

            setPort(messagePort);
        });
    }, []);

    const updateSerialPort = ({ value: portPath }: { value: string }) => {
        if (portPath !== selectedSerialport) {
            if (!modem) return;

            modem?.close();
            setModem(createModem(portPath));
        }

        setSelectedSerialport(portPath);
    };

    const dropdownItems = availablePorts.map(portPath => ({
        label: truncateMiddle(portPath, 20, 8),
        value: portPath as string,
    }));

    return (
        <SidePanel className="side-panel">
            <Group heading="Serialport trace capture">
                {availablePorts?.length > 0 && (
                    <Dropdown
                        onSelect={updateSerialPort}
                        items={dropdownItems}
                    />
                )}
            </Group>
            <button
                type="button"
                onClick={() => {
                    if (!port) openTerminal();
                }}
            >
                Terminal
            </button>
            <button
                type="button"
                onClick={() => {
                    if (!port) openTerminalLight();
                }}
            >
                Terminal Light
            </button>
            <button type="button" onClick={sendTerminalData}>
                Send terminal data
            </button>

            <button type="button" onClick={loadMainBundle}>
                Load main bundle
            </button>
        </SidePanel>
    );
};
