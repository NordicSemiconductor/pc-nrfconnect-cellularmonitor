import SerialPort from 'serialport';

import Modem from '../index';

const MockBinding = require('@serialport/binding-mock');

describe('modem', () => {
    it('emits a line event for unexpected data from the serial port', done => {
        const [modem, serialPort] = initialiseModem();

        const inputCommand = 'command';

        modem.on('line', data => {
            try {
                expect(data).toEqual(inputCommand);
                modem.close(done);
            } catch (e) {
                done(e);
            }
        });
        serialPort.write(`${inputCommand}\r\n`);
    });

    it('should handle OK response', done => {
        const [modem] = initialiseModem();

        const okResponse = 'OK';
        modem.on('response', res => {
            try {
                expect(res.lines[0]).toBe(okResponse);
                expect(res.error).toBe(undefined);
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

        modem.on('response', res => {
            try {
                expect(res.lines[0]).toBe(errorResponse);
                expect(res.error).toBe(errorResponse);
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
    return [new Modem(serialPort), serialPort];
}
