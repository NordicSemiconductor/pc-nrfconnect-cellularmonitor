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
import { withResizeDetector } from 'react-resize-detector';
import * as c from 'ansi-colors';
import * as md from 'markdown-to-ansi';
import { FitAddon } from 'xterm-addon-fit';
import { XTerm } from 'xterm-for-react';

import * as ATCommands from '../nRFmodem/ATCommands';
import { getKnownATCommands, getModemPort } from '../reducer';
import { NrfTerminalCommander, NrfTerminalConfig } from './pc-xterm-lib';

import 'xterm/css/xterm.css';
import './terminal.scss';
import colors from './colors.scss';

const fitAddon = new FitAddon();
let output = '';
const EOL = '\n';

// const atCommandList = [];
const completer = line => {
    const completions = ['/help']; // , ...knownATCommands
    const lastWord = line.substr(line.lastIndexOf(' ') + 1);
    const hits = completions.filter(str => str.startsWith(lastWord));
    return [hits.length ? hits : completions, lastWord];
};

const config: NrfTerminalConfig = {
    completions: [],
    commands: {
        my_custom_command: () => {
            console.log('Doing something...');
        },
    },
    prompt: 'AT[:lineCount]>',
    hoverMetadata: [],
    // showTimestamps: true,
};

const nrfTerminalCommander = new NrfTerminalCommander(config);

// const help = topic => {
//     const key = Object.keys(ATCommands).find(cmd => cmd.replace('__', '%').replace('_', '+') === topic);
//     if (!key) return;
//     const at = new ATCommands[key];
//     console.log(c.green(`Main:\n${md(at.manual.main)}\n\n` +
//     `Set command:\n${md(at.manual.set)}\n\n` +
//     `Read command:\n${md(at.manual.read)}\n\n` +
//     `Test command:\n${md(at.manual.test)}\n`));
// }

const TerminalComponent = ({
    width,
    height,
}: {
    width: number;
    height: number;
}) => {
    const xtermRef: React.MutableRefObject<XTerm | null> = useRef(null);

    const modemPort = useSelector(getModemPort);
    const knownATCommands = useSelector(getKnownATCommands);

    useEffect(() => {
        if (!modemPort) {
            xtermRef.current?.terminal.writeln(
                'Open a device to activate the terminal.'
            );
            return;
        }
        xtermRef.current?.terminal.clear();
        modemPort.on('rx', (data: string, unsolicited: boolean) => {
            let str = data
                // .replace(/\r$/, EOL)
                .replace(/(AT[+%][A-Z0-9]*)/g, (_, p1) => c.blueBright(p1))
                .replace(/(OK)\r/g, (_, p1) => c.yellowBright(p1))
                .replace(/(ERROR)\r/g, (_, p1) => c.redBright(p1))
                .replace(/(\+CESQ:)/g, (_, p1) => `\x1b[1;2;3H${p1}`);
            if (unsolicited) {
                str = c.italic(str);
            }
            xtermRef.current?.terminal.write(str);
        });
        modemPort.on('line', line => {
            xtermRef.current?.terminal.writeln(c.blue(line));
        });
        modemPort.on('response', () => {
            // prompt here
        });
    }, [modemPort]);

    useEffect(() => {
        if (width * height > 0) {
            fitAddon.fit();
        }
    }, [width, height]);

    useEffect(() => {
        // nrfTerminalCommander.autocompleteAddon.setCompletions(knownATCommands);
    }, [knownATCommands]);

    const onData = useCallback(
        (data: string) => {
            const str = data.replace('\r', EOL);
            console.log(str);
            xtermRef.current?.terminal.write(str);

            output = `${output}${str}`;
            let i: number;
            // eslint-disable-next-line no-cond-assign
            while ((i = output.indexOf(EOL)) > -1) {
                if (modemPort) {
                    const line = output.slice(0, i + EOL.length);
                    if (line !== EOL) {
                        console.log('send', line);
                        if (line.startsWith('AT')) {
                            modemPort.writeAT(line.trim(), (err, lines) => {
                                const color = err ? c.red : c.yellow;
                                lines.forEach(l => {
                                    xtermRef.current?.terminal.writeln(
                                        color(l)
                                    );
                                });
                                // prompt here
                            });
                            // } else if (line.startsWith('/help')) {
                            //     help(line.split(' ')[1]);
                            // } else if (line.startsWith('/quit')) {
                            //     port.close(process.exit);
                        }
                    }
                }
                output = output.slice(i + EOL.length);
            }
        },
        [modemPort]
    );

    return (
        <XTerm
            ref={xtermRef}
            addons={[
                fitAddon,
                // nrfTerminalCommander,
            ]}
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

export default withResizeDetector(TerminalComponent);
