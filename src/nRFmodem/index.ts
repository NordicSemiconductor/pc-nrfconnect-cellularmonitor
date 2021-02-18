import SerialPort, { parsers } from 'serialport';

export type Response = string[];
type Error = string | undefined | null;

const DELIMITER = '\r\n';
const LINE_READER = new parsers.Readline({ delimiter: DELIMITER });
const ERROR_PATTERN = /\+CM[ES] ERROR: (?<cause_value>.*)/;

const SUCCESS_MESSAGE = 'OK';
const ERROR_MESSAGE = 'ERROR';

class ModemPort extends SerialPort {
    private waitingForResponse = false;
    private incomingLines: string[] = [];
    private error: Error;

    constructor(path: string, opts = { baudRate: 112500 }) {
        super(path, { ...opts });

        this.pipe(LINE_READER).on('data', this.parseLine.bind(this));
    }

    private parseLine(line: string) {
        this.checkLineForError(line);
        this.handleLineResponse(line);
    }

    private checkLineForError(line: string) {
        if (line === SUCCESS_MESSAGE) {
            this.error = null;
        }
        if (line === ERROR_MESSAGE) {
            this.error = ERROR_MESSAGE;
        }
        this.error = line.match(ERROR_PATTERN)?.groups?.cause_value;
    }

    private handleLineResponse(line: string) {
        if (this.error !== undefined) {
            this.emit('response', {
                lines: [...this.incomingLines, line],
                error: this.error,
            });
            this.incomingLines = [];
        } else if (this.waitingForResponse) {
            this.incomingLines.push(line);
        } else {
            this.emit('line', line);
        }
    }

    writeAT(
        command: string,
        callback?: (err: string, response: Response) => void
    ): Promise<Response> | undefined {
        if (!callback) {
            return new Promise((resolve, reject) => {
                this.writeAT(command, (err, resp) =>
                    err ? reject(err) : resolve(resp)
                );
            });
        }

        if (this.waitingForResponse) return;
        this.waitingForResponse = true;

        this.prependOnceListener('response', ({ result, lines }) => {
            this.waitingForResponse = false;
            callback(result, lines);
        }).write(`${command}${DELIMITER}`);
    }
}

export default ModemPort;
