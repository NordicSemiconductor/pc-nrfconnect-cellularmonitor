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
import ReactResizeDetector from 'react-resize-detector';
import * as c from 'ansi-colors';
import * as ansi from 'ansi-escapes';
import { colors } from 'pc-nrfconnect-shared';
import { NrfTerminalCommander } from 'pc-xterm-lib';
import { FitAddon } from 'xterm-addon-fit';
import { XTerm } from 'xterm-for-react';

import { getModemPort } from '../reducer';

import 'xterm/css/xterm.css';
import './terminal.scss';

const fitAddon = new FitAddon();
const nrfTerminalCommander = new NrfTerminalCommander({
    commands: {
        my_custom_command: () => {
            console.log('Doing something...');
        },
    },
    prompt: 'AT[:lineCount]>',
    hoverMetadata: [],
    completerFunction: () => [
        {
            value: 'my_custom_command',
            description: 'Does something interesting',
        },
    ],
    showTimestamps: false,
});

let output = '';
const EOL = '\n';

const TerminalComponent = ({
    width,
    height,
}: {
    width: number;
    height: number;
}) => {
    const xtermRef: React.MutableRefObject<XTerm | null> = useRef(null);

    const modemPort = useSelector(getModemPort);

    const prompt = useCallback(() => {
        xtermRef.current?.terminal.write(
            nrfTerminalCommander.prompt.value + nrfTerminalCommander.output
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
        if (!modemPort) {
            writeln('Open a device to activate the terminal.');
            return;
        }
        xtermRef.current?.terminal.clear();
        modemPort.on('line', line => {
            writeln(c.blue(line));
        });
        // modemPort.on('response', () => { /* end of response */ });
    }, [modemPort, writeln]);

    useEffect(() => {
        if (width * height > 0) fitAddon.fit();
    }, [width, height]);

    const onData = useCallback(
        (data: string) => {
            const str = data.replace('\r', EOL);

            output = `${output}${str}`;
            let i: number;
            // eslint-disable-next-line no-cond-assign
            while ((i = output.indexOf(EOL)) > -1) {
                if (modemPort) {
                    const line = output.slice(0, i + EOL.length);
                    if (line !== EOL) {
                        if (line.startsWith('AT')) {
                            modemPort.writeAT(line.trim(), (err, lines) => {
                                const color = err ? c.red : c.yellow;
                                lines.forEach(l => {
                                    writeln(color(l));
                                });
                                prompt();
                            });
                        }
                    }
                }
                output = output.slice(i + EOL.length);
            }
        },
        [modemPort, prompt, writeln]
    );

    return (
        <XTerm
            ref={xtermRef}
            addons={[fitAddon, nrfTerminalCommander]}
            className="terminal-container"
            options={{
                convertEol: true,
                theme: {
                    foreground: colors.gray50,
                    background: colors.gray900,
                },
            }}
            onData={onData}
        />
    );
};

// TODO: Replace ReactResizeDetector with useResizeDetector hook when the
// related issue is solved:
// https://github.com/maslianok/react-resize-detector/issues/130

export default () => (
    <ReactResizeDetector handleWidth handleHeight>
        {({ width, height }) => (
            <TerminalComponent width={width || 0} height={height || 0} />
        )}
    </ReactResizeDetector>
);
