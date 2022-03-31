import React, { useCallback, useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { cursorTo, eraseLine } from 'ansi-escapes';
import { XTerm } from 'xterm-for-react';

import useFitAddon from '../src/hooks/useFitAddon';
import nrfTerminalCommander from '../terminal/src/terminalCommander';

export default Terminal;
export const Terminal = ({
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
