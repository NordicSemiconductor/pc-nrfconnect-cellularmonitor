import Readline from '@serialport/parser-readline';
import SerialPort from 'serialport';

export type Response = string[];

class ModemPort extends SerialPort {
    private waitingForResponse: boolean;

    constructor(path: string, opts = { baudRate: 112500 }) {
        super(path, { ...opts });

        this.waitingForResponse = false;

        const lines: string[] = [];
        this.pipe(new Readline({ delimiter: '\r\n' })).on(
            'data',
            (line: string) => {
                let error;
                if (line === 'OK') error = null;
                if (line === 'ERROR') error = 'ERROR';
                else {
                    const match = /\+CM[ES] ERROR: (?<cause_value>.*)/.exec(
                        line
                    );
                    if (match) {
                        error = match[0].groups.cause_value;
                    }
                }
                if (error !== undefined) {
                    lines.push(line);
                    this.emit('response', { lines: lines.slice(0), error });
                    lines.splice(0);
                } else if (this.waitingForResponse) {
                    lines.push(line);
                } else {
                    this.emit('line', line);
                }
            }
        );
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
        }).write(`${command}\r\n`);
    }
}

export default ModemPort;
