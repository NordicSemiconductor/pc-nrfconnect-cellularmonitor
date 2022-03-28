import React, { useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useResizeDetector } from 'react-resize-detector';
import * as ansi from 'ansi-escapes';
import { ipcRenderer } from 'electron';
import { XTerm } from 'xterm-for-react';

import nrfTerminalCommander from '../src/components/Terminal/terminalCommander';
import useFitAddon from '../src/hooks/useFitAddon';

ipcRenderer.once('parent-id', (_, id) => {
    const commandCallback = (command: string) => {
        ipcRenderer.sendTo(id, 'terminal-data', command?.trim());
    };

    const onModemData = (listener: (data: string) => void) => {
        ipcRenderer.on('terminal-data', (ev, data) => listener(data));
    };

    ReactDOM.render(
        <Main commandCallback={commandCallback} onModemData={onModemData} />,
        document.getElementById('app')
    );
});

const Main = ({
    commandCallback,
    onModemData,
}: {
    commandCallback: (command: string) => void;
    onModemData: (listener: (line: string) => void) => void;
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
            xtermRef.current?.terminal.write(ansi.eraseLine + ansi.cursorTo(0));
            xtermRef.current?.terminal.write(line);
            prompt();
        },
        [prompt]
    );

    const handleUserInputLine = useCallback(
        (line: string) => {
            if (line === '\n') return;
            if (line.startsWith('AT')) {
                commandCallback(line.trim());
            } else {
                writeln('Invalid command format');
            }
        },
        [commandCallback, writeln]
    );

    useEffect(() => {
        nrfTerminalCommander.onRunCommand(handleUserInputLine);
    }, [handleUserInputLine]);

    useEffect(() => {
        onModemData(writeln);
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
                className="fullHeight"
                options={terminalOptions}
            />
        </div>
    );
};
