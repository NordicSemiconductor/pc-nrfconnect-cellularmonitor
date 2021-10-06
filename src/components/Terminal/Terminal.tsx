/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useResizeDetector } from 'react-resize-detector';
import * as c from 'ansi-colors';
import * as ansi from 'ansi-escapes';
import { colors } from 'pc-nrfconnect-shared';
import { XTerm } from 'xterm-for-react';

import { Response } from '../../features/modem/modem';
import { getModem } from '../../features/modem/modemSlice';
import useFitAddon from '../../hooks/useFitAddon';
import nrfTerminalCommander from './terminalCommander';

import 'xterm/css/xterm.css';
import './terminal.scss';

const TerminalComponent = () => {
    const xtermRef = useRef<XTerm | null>(null);

    const modem = useSelector(getModem);
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

    const handleModemResponse = useCallback(
        (lines: Response, err?: string) => {
            const color = err ? c.red : c.yellow;
            lines.forEach(l => {
                writeln(color(l));
            });
        },
        [writeln]
    );

    useEffect(() => {
        if (!modem) {
            writeln(c.yellow('Open a device to activate the terminal.'));
            return;
        }
        xtermRef.current?.terminal.clear();
        const unregisterOnLine = modem.onLine(line => writeln(c.blue(line)));
        const unregisterOnResponse = modem.onResponse(handleModemResponse);
        return () => {
            unregisterOnLine();
            unregisterOnResponse();
        };
    }, [modem, writeln, handleModemResponse]);

    const handleUserInputLine = useCallback(
        (line: string) => {
            if (line === '\n') return; // check if this ever happens
            if (modem != null && line.startsWith('AT')) {
                const commandWasAccepted = modem.write(line.trim());
                if (!commandWasAccepted) {
                    writeln(
                        c.red(
                            'Command rejected while processing previous command'
                        )
                    );
                }
            }
        },
        [modem, writeln]
    );

    useEffect(() => {
        if (modem) {
            return nrfTerminalCommander.onRunCommand(handleUserInputLine);
        }
    }, [modem, handleUserInputLine]);

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
