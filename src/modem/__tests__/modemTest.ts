import SerialPort, { parsers } from 'serialport';

import Modem from '../index';

const MockBinding = require('@serialport/binding-mock');

describe('modem', () => {
    it('should write to modem', done => {
        const [modem, modemReadline] = initialiseModem();

        const inputCommand = 'command';

        modemReadline.on('data', data => {
            try {
                expect(data).toEqual(inputCommand);
                modem.close(done);
            } catch (e) {
                done(e);
            }
        });
        modem.writeAT(inputCommand);
    });

    it('should handle OK response', done => {
        const [modem] = initialiseModem();

        const okResponse = 'OK';
        modem.on('response', res => {
            try {
                expect(res.lines[0]).toBe(okResponse);
                expect(res.error).toBe(null);
                modem.close(done);
            } catch (e) {
                done(e);
            }
        });
        modem.writeAT(okResponse);
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

        modem.writeAT(errorResponse);
    });
});

// SETUP

function initialiseModem(): [Modem, parsers.Readline] {
    SerialPort.Binding = MockBinding;

    // Create a port and enable echoing of input
    MockBinding.createPort('/dev/PORT', {
        echo: true,
        readyData: Buffer.from([]),
    });
    const modem = new Modem('/dev/PORT');
    const modemReadline = modem.pipe(
        new parsers.Readline({ delimiter: '\r\n' })
    );
    return [modem, modemReadline];
}
