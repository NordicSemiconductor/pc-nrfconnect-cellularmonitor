import EventEmitter from 'events';
import SerialPort, { parsers } from 'serialport';

export type Response = string[];

const DELIMITER = '\r\n';
const ERROR_PATTERN = /\+CM[ES] ERROR: (?<cause_value>.*)/;

const SUCCESS_MESSAGE = 'OK';
const ERROR_MESSAGE = 'ERROR';

class Modem extends EventEmitter {
    private waitingForResponse = false;
    private incomingLines: string[] = [];
    private serialPort: SerialPort;

    constructor(serialPort: SerialPort) {
        super();
        this.serialPort = serialPort;

        const lineReader = new parsers.Readline({ delimiter: DELIMITER });
        this.serialPort.pipe(lineReader).on('data', this.parseLine.bind(this));
    }

    private parseLine(line: string) {
        const error = Modem.checkLineForError(line);
        this.emitLineResponse(line, error);
    }

    private static checkLineForError(line: string) {
        if (line === SUCCESS_MESSAGE) {
            return null;
        }
        if (line === ERROR_MESSAGE) {
            return ERROR_MESSAGE;
        }
        return line.match(ERROR_PATTERN)?.groups?.cause_value;
    }

    private emitLineResponse(line: string, error?: string | null) {
        if (error !== undefined) {
            this.emit('response', {
                lines: [...this.incomingLines, line],
                error,
            });
            this.incomingLines = [];
        } else if (this.waitingForResponse) {
            this.incomingLines.push(line);
        } else {
            this.emit('line', line);
        }
    }

    close(callback?: (error?: Error | null) => void) {
        this.serialPort.close(callback);
    }

    write(
        command: string,
        callback?: (err: string, response: Response) => void
    ): Promise<Response> | undefined {
        if (!callback) {
            return new Promise((resolve, reject) => {
                this.write(command, (err, resp) => {
                    err ? reject(err) : resolve(resp);
                });
            });
        }
        if (this.waitingForResponse) return;
        this.waitingForResponse = true;

        const responseHandler = ({
            result,
            lines,
        }: {
            result: string;
            lines: Response;
        }) => {
            this.waitingForResponse = false;
            callback(result, lines);
        };
        this.prependOnceListener('response', responseHandler);
        this.serialPort.write(command + DELIMITER);
    }
}

export default Modem;
