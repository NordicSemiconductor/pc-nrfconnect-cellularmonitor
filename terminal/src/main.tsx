import React, { FC, useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

export const Main: FC = () => {
    const [terminalData, setTerminalData] = useState<string[]>([]);

    useEffect(() => {
        const handler = (_: unknown, data: string) => {
            setTerminalData([...terminalData, data]);
            console.log(data, new Date().getTime());
        };
        ipcRenderer.on('terminal-data', handler);
    }, []);

    return (
        <div>
            <h3>Terminal</h3>
            {terminalData.map((data, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={i}>{data}</div>
            ))}
        </div>
    );
};
