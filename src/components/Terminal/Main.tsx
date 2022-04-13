/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { getAppDir, PaneProps } from 'pc-nrfconnect-shared';

import {
    getModem,
    getPopoutId,
    setPopoutId,
} from '../../features/terminal/terminalSlice';
import PopoutPlaceholder from './Popout';
import Terminal from './Terminal';

import './overlay.scss';

const Main = ({ active }: PaneProps) => {
    const modem = useSelector(getModem);
    const popoutId = useSelector(getPopoutId);
    const modemCallbacks = useRef<(() => void)[]>([]);
    const dispatch = useDispatch();

    const cleanupModemCallbacks = useCallback(() => {
        if (modemCallbacks.current.length > 0) {
            modemCallbacks.current.forEach(f => f());
            modemCallbacks.current = [];
        }
    }, []);

    const onModemData = useCallback<
        (listener: (data: string) => void) => () => void
    >(
        (listener: (data: string) => void) => {
            if (!modem) return () => {};
            modemCallbacks.current.push(modem.onLine(listener));
            modemCallbacks.current.push(
                modem.onResponse(lines => lines.forEach(listener))
            );

            return cleanupModemCallbacks;
        },
        [modem, cleanupModemCallbacks]
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
        ipcRenderer.on('popout-closed', () => dispatch(setPopoutId(undefined)));
    }, [dispatch]);

    const openTerminalLight = async () => {
        const file = `${getAppDir()}/terminal-light/index.html`;
        const id = await ipcRenderer.invoke('open-popout', file);
        dispatch(setPopoutId(id));
    };

    return (
        <>
            {popoutId ? (
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
                        <button
                            type="button"
                            onClick={() => openTerminalLight()}
                        >
                            Open in separate window
                            <span className="mdi mdi-open-in-new" />
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default Main;
