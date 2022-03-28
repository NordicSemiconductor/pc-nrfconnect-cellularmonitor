import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useResizeDetector } from 'react-resize-detector';
import * as ansi from 'ansi-escapes';
import { ipcRenderer } from 'electron';
import { XTerm } from 'xterm-for-react';

import nrfTerminalCommander from '../src/components/Terminal/terminalCommander';
import useFitAddon from '../src/hooks/useFitAddon';

const Main = () => {
    const xtermRef = useRef<XTerm | null>(null);

    const [parentId, setParentId] = useState<number>();
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
            if (!parentId) return;
            if (line === '\n') return; // check if this ever happens
            if (line.startsWith('AT'))
                ipcRenderer.sendTo(parentId, 'terminal-data', line.trim());
            else {
                writeln('Invalid command format');
            }
        },
        [parentId, writeln]
    );

    useEffect(() => {
        if (parentId)
            return nrfTerminalCommander.onRunCommand(handleUserInputLine);
    }, [parentId, handleUserInputLine]);

    useEffect(() => {
        ipcRenderer.on('parent-id', (_, id) => setParentId(id));
    }, []);

    useEffect(() => {
        ipcRenderer.on('terminal-data', (_, data) => writeln(data));
    }, [writeln]);

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
                className="fullHeight"
                options={terminalOptions}
            />
        </div>
    );
};

ReactDOM.render(<Main />, document.getElementById('app'));
