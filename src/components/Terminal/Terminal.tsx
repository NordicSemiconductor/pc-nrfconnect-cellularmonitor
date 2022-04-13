/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { cursorTo, eraseLine } from 'ansi-escapes';
import { XTerm } from 'xterm-for-react';

import useFitAddon from '../../hooks/useFitAddon';
import nrfTerminalCommander from './terminalCommander';

import 'xterm/css/xterm.css';
import './terminal.css';

export const Terminal = ({
    commandCallback,
    onModemData,
}: {
    commandCallback: (command: string) => string | undefined;
    onModemData: (listener: (line: string) => void) => () => void;
}) => {
    const xtermRef = useRef<XTerm | null>(null);
    const { width, height, ref: resizeRef } = useResizeDetector();
    const fitAddon = useFitAddon(height, width);

    const prompt = useCallback(() => {
        xtermRef.current?.terminal.write(
            nrfTerminalCommander.prompt.value + nrfTerminalCommander.userInput
        );
    }, []);

    const writeln = useCallback(
        (line: string) => {
            xtermRef.current?.terminal.write(eraseLine + cursorTo(0));
            xtermRef.current?.terminal.write(line);
            prompt();
        },
        [prompt]
    );

    const handleUserInputLine = useCallback(
        (line: string) => {
            if (line === '\n') return;
            if (line.startsWith('AT')) {
                const ret = commandCallback(line.trim());
                if (ret) writeln(ret);
            } else writeln('Invalid command format');
        },
        [commandCallback, writeln]
    );

    useEffect(() => {
        const unregisterOnRunCommand =
            nrfTerminalCommander.onRunCommand(handleUserInputLine);

        return () => {
            unregisterOnRunCommand();
        };
    }, [handleUserInputLine]);

    useEffect(() => {
        const unregisterOnModemData = onModemData(writeln);

        return () => {
            unregisterOnModemData();
        };
    }, [writeln, onModemData]);

    useEffect(() => {
        xtermRef.current?.terminal.write(
            `AT[1]> ${nrfTerminalCommander.userInput}`
        );
    }, []);

    const terminalOptions = {
        convertEol: true,
        theme: {
            foreground: '#eceff1',
            background: '#263238',
        },
    };

    return (
        <div ref={resizeRef} style={{ height: '100%' }}>
            <XTerm
                ref={xtermRef}
                addons={[fitAddon, nrfTerminalCommander]}
                className="terminal-window"
                options={terminalOptions}
            />
        </div>
    );
};

export default Terminal;
