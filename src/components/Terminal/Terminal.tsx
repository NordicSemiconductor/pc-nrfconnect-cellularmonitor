/* Copyright (c) 2015 - 2021, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useResizeDetector } from 'react-resize-detector';
import * as c from 'ansi-colors';
import * as ansi from 'ansi-escapes';
import { colors } from 'pc-nrfconnect-shared';
import { XTerm } from 'xterm-for-react';

import useFitAddon from '../../hooks/useFitAddon';
import { Response } from '../../modem/modem';
import { getModem } from '../../reducer';
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
