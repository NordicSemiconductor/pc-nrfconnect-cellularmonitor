/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { getAppDir } from 'pc-nrfconnect-shared';

import { getModem } from '../../features/modem/modemSlice';
import PopoutPlaceholder from './Popout';
import Terminal from './Terminal';

import './overlay.scss';

let terminalWindowId: number;

const openTerminalLight = async () => {
    const file = `${getAppDir()}/terminal-light/index.html`;
    terminalWindowId = await ipcRenderer.invoke('open-terminal-app', file);
};

const Main = () => {
    const modem = useSelector(getModem);
    const [popout, setPopout] = useState<boolean>(false);
    const modemCallbacks = useRef<(() => void)[]>([]);

    const cleanupModemCallbacks = useCallback(() => {
        if (modemCallbacks.current.length > 0) {
            modemCallbacks.current.forEach(f => f());
            modemCallbacks.current = [];
        }
    }, []);

    useEffect(
        () => () => {
            if (!modem) cleanupModemCallbacks();
        },
        [modem, cleanupModemCallbacks]
    );

    const setupModemCallbacks = useCallback(
        (onLine, onResponse) => {
            if (!modem) return;
            cleanupModemCallbacks();
            modemCallbacks.current.push(modem.onLine(onLine));
            modemCallbacks.current.push(modem.onResponse(onResponse));
        },
        [modem, cleanupModemCallbacks]
    );

    const onModemData = useCallback(
        (listener: (data: string) => void) => {
            setupModemCallbacks(
                (line: string) => listener(line),
                (lines: string[]) => lines.forEach(listener)
            );
        },
        [setupModemCallbacks]
    );

    const commandCallback = useCallback(
        (command: string) => {
            if (!modem) return 'Please connect a device and select a port';
            if (!modem?.write(command.trim()))
                return 'Modem busy or invalid command';
        },
        [modem]
    );

    return (
        <>
            {popout ? (
                <PopoutPlaceholder
                    popoutId={terminalWindowId}
                    commandCallback={commandCallback}
                    onModemData={onModemData}
                />
            ) : (
                <>
                    <Terminal
                        commandCallback={commandCallback}
                        onModemData={onModemData}
                    />
                    <div id="popout-control">
                        <button
                            type="button"
                            onClick={() => {
                                openTerminalLight();
                                setPopout(true);
                            }}
                        >
                            Pop out
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default Main;
