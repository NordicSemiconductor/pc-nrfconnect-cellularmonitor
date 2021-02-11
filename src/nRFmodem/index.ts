import SerialPort, { parsers } from 'serialport';

export type Response = string[];
console.log('parsers');
console.log(parsers.Readline);
class ModemPort extends SerialPort {
    private waitingForResponse = false;

    private incomingLines: string[] = [];

    constructor(path: string, opts = { baudRate: 112500 }) {
        super(path, { ...opts });

        this.pipe(new parsers.Readline({ delimiter: '\r\n' })).on(
            'data',
            this.parseLine.bind(this)
        );
    }

    private parseLine(line: string) {
        let error;
        if (line === 'OK') error = null;
        else if (line === 'ERROR') error = 'ERROR';
        else {
            error = line.match(/\+CM[ES] ERROR: (?<cause_value>.*)/)?.groups
                ?.cause_value;
        }
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
