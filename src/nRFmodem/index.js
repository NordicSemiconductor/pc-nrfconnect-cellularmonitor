import Readline from '@serialport/parser-readline';
import * as c from 'ansi-colors';
import * as md from 'markdown-to-ansi';
import SerialPort from 'serialport';

import * as ATCommands from './nrf_at_commands';

const atCommandList = [];
const completer = line => {
    const completions = ['/help', '/quit', ...atCommandList];
    const lastWord = line.substr(line.lastIndexOf(' ') + 1);
    const hits = completions.filter(str => str.startsWith(lastWord));
    return [hits.length ? hits : completions, lastWord];
};

const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    completer,
});

class ModemPort extends SerialPort {
    constructor(path, opts = { baudRate: 112500 }) {
        super(path, { ...opts });

        this.waiting = false;

        const lines = [];
        this.pipe(new Readline({ delimiter: '\r\n' })).on('data', line => {
            let result;
            if (line === 'OK') result = null;
            if (line === 'ERROR') result = 'ERROR';
            else {
                const match = /\+CM[ES] ERROR: (?<cause_value>.*)/.exec(line);
                if (match) {
                    result = match[0].groups.cause_value;
                }
            }
            if (result !== undefined) {
                lines.push(line);
                this.emit('response', { lines: lines.slice(0), result });
                lines.splice(0);
            } else if (this.waiting) {
                lines.push(line);
            } else {
                this.emit('line', line);
            }
        });
    }

    writeAT(command, callback) {
        if (this.waiting) return false;
        this.waiting = true;
        this.prependOnceListener('response', ({ result, lines }) => {
            this.waiting = false;
            callback(result, lines);
        }).write(`${command}\r\n`);
        return true;
    }
}

// const port = new ModemPort('/dev/tty.usbmodem0009600859681');

// port.on('line', line => {
//     console.log(c.blue(line));
// });

// port.on('response', () => rl.prompt());

// port.writeAT('AT+CLAC', (err, lines) => {
//     if (!err) {
//         lines.pop(); // remove OK
//         atCommandList.splice(0);
//         atCommandList.push(...lines);
//     }
// });

// const help = topic => {
//     const key = Object.keys(ATCommands).find(cmd => cmd.replace('__', '%').replace('_', '+') === topic);
//     if (!key) return;
//     const at = new ATCommands[key];
//     console.log(c.green(`Main:\n${md(at.manual.main)}\n\n` +
//     `Set command:\n${md(at.manual.set)}\n\n` +
//     `Read command:\n${md(at.manual.read)}\n\n` +
//     `Test command:\n${md(at.manual.test)}\n`));
// }

// rl.prompt();
// rl.on('line', (line) => {
//     if (line.startsWith('AT')) {
//         port.writeAT(line.trim(), (err, lines) => {
//             const color = err ? c.red : c.yellow;
//             console.log(color(lines.join('\n')));
//             rl.prompt();
//         });
//     } else if (line.startsWith('/help')) {
//         help(line.split(' ')[1]);
//     } else if (line.startsWith('/quit')) {
//         port.close(process.exit);
//     }
// });

export default ModemPort;
