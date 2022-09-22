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
import './terminal.scss';
import { LogEntry } from '../../features/terminal/terminalSlice';

const Terminal = ({
    commandCallback,
    onModemData,
    savedLogs,
}: {
    commandCallback: (command: string) => string | undefined;
    onModemData: (listener: (line: string) => void) => () => void;
    savedLogs?: LogEntry[];
}) => {
    const xtermRef = useRef<XTerm | null>(null);
    const { width, height, ref: resizeRef } = useResizeDetector();
    const fitAddon = useFitAddon(height, width);

    const writeReply = (line: string) =>
        xtermRef.current?.terminal.write(`\n${line}`);

    const handleUserInputLine = useCallback(
        (line: string) => {
            if (line === '\n') return;
            if (line.startsWith('AT')) {
                const ret = commandCallback(line.trim());
                if (ret) writeReply(ret);
            } else writeReply('Invalid command format');
        },
        [commandCallback]
    );

    useEffect(() => {
        const unregisterOnRunCommand =
            nrfTerminalCommander.onRunCommand(handleUserInputLine);

        return () => unregisterOnRunCommand();
    }, [handleUserInputLine]);

    useEffect(() => {
        const unregisterOnModemData = onModemData(line => {
            xtermRef.current?.terminal.write(eraseLine + cursorTo(0));
            xtermRef.current?.terminal.write(line);
            xtermRef.current?.terminal.write(
                nrfTerminalCommander.prompt.value +
                    nrfTerminalCommander.userInput
            );
        });

        return () => unregisterOnModemData();
    }, [onModemData]);

    useEffect(() => {
        if (savedLogs && savedLogs.length > 0)
            savedLogs.forEach(line => {
                if (line.type === 'user')
                    xtermRef.current?.terminal.write(
                        nrfTerminalCommander.prompt.value.trim()
                    );
                xtermRef.current?.terminal.write(`${line.value}\n`);
            });

        xtermRef.current?.terminal.write(
            `${nrfTerminalCommander.prompt.value.trim()} `
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
