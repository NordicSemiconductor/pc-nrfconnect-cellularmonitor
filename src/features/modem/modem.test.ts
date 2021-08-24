import SerialPort from 'serialport';

import { createModem, Modem } from './modem';

const MockBinding = require('@serialport/binding-mock');

describe('modem', () => {
    it('emits a line event for unexpected data from the serial port', done => {
        const [modem, serialPort] = initialiseModem();

        const inputCommand = 'command';

        modem.onLine(data => {
            try {
                expect(data).toEqual(inputCommand);
                modem.close(done);
            } catch (e) {
                done(e);
            }
        });
        serialPort.write(`${inputCommand}\r\n`);
    });

    it('accepts a command', () => {
        const [modem] = initialiseModem();
        const result = modem.write('command');

        expect(result).toBe(true);
    });

    it('rejects a command while the previous command is processed', () => {
        const [modem] = initialiseModem();
        modem.write('one command');
        const result = modem.write('second command');

        expect(result).toBe(false);
    });

    it('should handle OK response', done => {
        const [modem] = initialiseModem();

        const okResponse = 'OK';
        modem.onResponse((lines, error) => {
            try {
                expect(lines[0]).toBe(okResponse);
                expect(error).toBe(undefined);
                modem.close(done);
            } catch (e) {
                done(e);
            }
        });
        modem.write(okResponse);
    });

    it('should handle errors', done => {
        const [modem] = initialiseModem();
        const errorResponse = 'ERROR';

        modem.onResponse((lines, error) => {
            try {
                expect(lines[0]).toBe(errorResponse);
                expect(error).toBe(errorResponse);
                modem.close(done);
            } catch (e) {
                done(e);
            }
        });

        modem.write(errorResponse);
    });
});

// SETUP

function initialiseModem(): [Modem, SerialPort] {
    SerialPort.Binding = MockBinding;
    const port = '/dev/PORT';
    // Create a port and enable echoing of input
    MockBinding.createPort(port, {
        echo: true,
        readyData: Buffer.from([]),
    });
    const serialPort = new SerialPort(port);
    return [createModem(serialPort), serialPort];
}