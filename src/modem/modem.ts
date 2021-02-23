import EventEmitter from 'events';
import SerialPort, { parsers } from 'serialport';

export type Response = string[];

const DELIMITER = '\r\n';
const AT_ERROR_PATTERN = /\+CM[ES] ERROR: (?<cause_value>.*)/;

const SUCCESS_MESSAGE = 'OK';
const ERROR_MESSAGE = 'ERROR';

const parseLine = (line: string) => {
    if (line === SUCCESS_MESSAGE) {
        return { complete: true };
    }
    if (line === ERROR_MESSAGE) {
        return { complete: true, error: ERROR_MESSAGE };
    }

    const errorMessage = line.match(AT_ERROR_PATTERN)?.groups?.cause_value;
    return { complete: errorMessage != null, error: errorMessage };
};

class Modem {
    private waitingForResponse = false;
    private incomingLines: string[] = [];
    private serialPort: SerialPort;
    private eventEmitter = new EventEmitter();

    constructor(serialPort: SerialPort) {
        this.serialPort = serialPort;

        const lineReader = new parsers.Readline({ delimiter: DELIMITER });
        this.serialPort.pipe(lineReader).on('data', this.handleLine.bind(this));
    }

    private handleLine(line: string) {
        if (!this.waitingForResponse) {
            this.eventEmitter.emit('line', line);
            return;
        }

        const { complete, error } = parseLine(line);
        if (!complete) {
            this.incomingLines.push(line);
            return;
        }

        this.eventEmitter.emit(
            'response',
            [...this.incomingLines, line],
            error
        );
        this.incomingLines = [];
    }

    onLine(handler: (line: string) => void) {
        this.eventEmitter.on('line', handler);
        return () => this.eventEmitter.removeListener('line', handler);
    }

    onResponse(handler: (lines: Response, error?: string) => void) {
        this.eventEmitter.on('response', handler);
        return () => this.eventEmitter.removeListener('response', handler);
    }

    close(callback?: (error?: Error | null) => void) {
        this.serialPort.close(callback);
    }

    write(command: string) {
        if (this.waitingForResponse) return;
        this.waitingForResponse = true;

        this.eventEmitter.prependOnceListener('response', () => {
            this.waitingForResponse = false;
        });
        this.serialPort.write(command + DELIMITER);
    }
}

export default Modem;
