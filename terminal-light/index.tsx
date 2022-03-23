import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useResizeDetector } from 'react-resize-detector';
import { ipcRenderer } from 'electron';
import { XTerm } from 'xterm-for-react';

import useFitAddon from '../src/hooks/useFitAddon';

const terminalOptions = {
    convertEol: true,
    theme: {
        foreground: '#eceff1',
        background: '#263238',
    },
};

const Main = () => {
    const xtermRef = React.useRef<XTerm>(null);
    const { width, height, ref: resizeRef } = useResizeDetector();
    const fitAddon = useFitAddon(height, width);

    const writeln = (line: string) => xtermRef.current?.terminal.writeln(line);

    useEffect(() => {
        ipcRenderer.on('terminal-data', (_, data) => writeln(data));
    }, []);

    return (
        <div ref={resizeRef} style={{ height: '100%' }}>
            <XTerm
                ref={xtermRef}
                addons={[fitAddon]}
                className="fullHeight"
                options={terminalOptions}
            />
        </div>
    );
};

ReactDOM.render(<Main />, document.getElementById('app'));
