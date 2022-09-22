/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { getAppDir, PaneProps } from 'pc-nrfconnect-shared';

import {
    getModem,
    getPopoutId,
    setPopoutId,
} from '../../features/terminal/terminalSlice';
import { getPopoutTerminal, setPopoutTerminal } from '../../utils/store';
import PopoutPlaceholder from './Popout';
import Terminal from './Terminal';

import './overlay.scss';

const Main = ({ active }: PaneProps) => {
    const modem = useSelector(getModem);
    const popoutId = useSelector(getPopoutId);
    const dispatch = useDispatch();

    const onModemData = useCallback(
        (listener: (data: string) => void) => {
            if (!modem) return () => {};

            const cleanup = [
                modem.onLine(listener),
                modem.onResponse(lines => lines.forEach(listener)),
            ];

            return () => cleanup.forEach(fn => fn());
        },
        [modem]
    );

    const commandCallback = useCallback(
        (command: string) => {
            if (!modem) return 'Please connect a device and select a port';
            if (!modem?.write(command.trim()))
                return 'Modem busy or invalid command';
        },
        [modem]
    );

    const closePopout = useCallback(() => {
        if (popoutId) ipcRenderer.sendTo(popoutId, 'close-popout');
    }, [popoutId]);

    useEffect(() => {
        ipcRenderer.on('popout-closed', () => {
            setPopoutTerminal(false);
            dispatch(setPopoutId(undefined));
        });
    }, [dispatch]);

    const openTerminalLight = async () => {
        const file = `${getAppDir()}/terminal-light/index.html`;
        const id = await ipcRenderer.invoke('open-popout', file);
        dispatch(setPopoutId(id));
        setPopoutTerminal(true);
    };

    useEffect(() => {
        if (getPopoutTerminal()) openTerminalLight();
    }, []);

    return popoutId ? (
        <PopoutPlaceholder
            popoutId={popoutId}
            commandCallback={commandCallback}
            onModemData={onModemData}
            closePopout={closePopout}
        />
    ) : (
        <>
            {active && (
                <Terminal
                    commandCallback={commandCallback}
                    onModemData={onModemData}
                />
            )}
            <div className="open-popout">
                <button type="button" onClick={() => openTerminalLight()}>
                    Open in separate window
                    <span className="mdi mdi-open-in-new" />
                </button>
            </div>
        </>
    );
};

export default Main;
