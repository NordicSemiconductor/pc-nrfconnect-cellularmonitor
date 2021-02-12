import { useEffect } from 'react';
import { FitAddon } from 'xterm-addon-fit';

const fitAddon = new FitAddon();

const useFitAddon = (height: number, width: number) => {
    useEffect(() => {
        if (width * height > 0) fitAddon.fit();
    }, [width, height]);

    return fitAddon;
};

export default useFitAddon;
