/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ReadlineParser } from '@serialport/parser-readline';
import EventEmitter from 'events';
import { SerialPort } from 'serialport';

export type Response = string[];

const DELIMITER = '\r\n';

const parseLine = (line: string) => {
    if (line === 'OK') {
        return { complete: true };
    }

    if (line === 'ERROR') {
        return { complete: true, error: line };
    }

    const AT_ERROR_PATTERN = /\+CM[ES] ERROR: (?<cause_value>.*)/;
    const errorMessage = line.match(AT_ERROR_PATTERN)?.groups?.cause_value;
    return { complete: errorMessage != null, error: errorMessage };
};

const createHandleLine = (eventEmitter: EventEmitter) => {
    let incomingLines: string[] = [];

    return (line: string, waitingForResponse: boolean) => {
        if (!waitingForResponse) {
            eventEmitter.emit('line', line);
            return;
        }

        const { complete, error } = parseLine(line);
        if (!complete) {
            incomingLines.push(line);
            return;
        }

        eventEmitter.emit('response', [...incomingLines, line], error);
        incomingLines = [];
    };
};

export type Modem = ReturnType<typeof createModem>;

export const createModem = (serialPort: SerialPort) => {
    const eventEmitter = new EventEmitter();
    let waitingForResponse = false;

    const lineSplitter = new ReadlineParser({ delimiter: DELIMITER });
    const handleLine = createHandleLine(eventEmitter);
    serialPort
        .pipe(lineSplitter)
        .on('data', (line: string) => handleLine(line, waitingForResponse));

    return {
        onLine: (handler: (line: string) => void) => {
            eventEmitter.on('line', handler);
            return () => eventEmitter.removeListener('line', handler);
        },

        onResponse: (handler: (lines: Response, error?: string) => void) => {
            eventEmitter.on('response', handler);
            return () => eventEmitter.removeListener('response', handler);
        },

        close: (callback?: (error?: Error | null) => void) => {
            serialPort.close(callback);
        },

        write: (command: string) => {
            if (waitingForResponse) return false;
            waitingForResponse = true;

            eventEmitter.prependOnceListener('response', () => {
                waitingForResponse = false;
            });
            serialPort.write(command + DELIMITER);

            return true;
        },
    };
};
