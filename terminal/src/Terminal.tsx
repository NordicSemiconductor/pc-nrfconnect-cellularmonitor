/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import * as ansi from 'ansi-escapes';
import { ipcRenderer } from 'electron';
import { colors } from 'pc-nrfconnect-shared';
import { XTerm } from 'xterm-for-react';

// eslint-disable-next-line import/no-relative-packages
import useFitAddon from '../../src/hooks/useFitAddon';
import nrfTerminalCommander from './terminalCommander';

import 'xterm/css/xterm.css';
import './terminal.scss';

const TerminalComponent = () => {
    const xtermRef = useRef<XTerm | null>(null);

    const [port, setPort] = useState<MessagePort>();
    const { width, height, ref: resizeRef } = useResizeDetector();
    const fitAddon = useFitAddon(height, width);

    const prompt = useCallback(() => {
        xtermRef.current?.terminal.write(
            nrfTerminalCommander.prompt.value + nrfTerminalCommander.userInput
        );
    }, []);

    const writeln = useCallback(
        (line: string | Uint8Array) => {
            xtermRef.current?.terminal.write(ansi.eraseLine + ansi.cursorTo(0));
            xtermRef.current?.terminal.write(line);
            prompt();
        },
        [prompt]
    );
    useEffect(() => {
        xtermRef.current?.terminal.write(
            `AT[1]> ${nrfTerminalCommander.userInput}`
        );
    }, []);

    const handleUserInputLine = useCallback(
        (line: string) => {
            if (!port) return;
            if (line === '\n') return; // check if this ever happens
            if (line.startsWith('AT')) port.postMessage(line.trim());
            else {
                writeln('Invalid command format');
            }
        },
        [port, writeln]
    );

    useEffect(() => {
        if (port) {
            return nrfTerminalCommander.onRunCommand(handleUserInputLine);
        }
    }, [port, handleUserInputLine]);

    useEffect(() => {
        if (!port) return;

        console.log('Setting messageport callbacks');

        port.onmessage = e => writeln(e.data);
        port.addEventListener('close', () => {
            port.close();
            setPort(undefined);
            console.log('Port disconnected');
        });
    }, [port, writeln]);

    useEffect(() => {
        ipcRenderer.on('new-window-port', event => setPort(event.ports[0]));
    }, []);

    const terminalOptions = {
        convertEol: true,
        theme: {
            foreground: colors.gray50,
            background: colors.gray900,
        },
    };

    return (
        <div ref={resizeRef} style={{ height: '100%' }}>
            <XTerm
                ref={xtermRef}
                addons={[fitAddon, nrfTerminalCommander]}
                className="terminal-container"
                options={terminalOptions}
            />
        </div>
    );
};

export default TerminalComponent;
