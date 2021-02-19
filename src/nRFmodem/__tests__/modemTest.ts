import SerialPort, { parsers } from 'serialport';

import ModemPort from '../index';

const MockBinding = require('@serialport/binding-mock');

describe('modem', () => {
    const [modem, modemReadline] = initialiseModem();

    it('should write to modem', done => {
        const inputCommand = 'command';

        modemReadline.on('data', data => {
            try {
                expect(data.length).toBe(inputCommand.length);
                expect(data).toEqual(inputCommand);
                modem.close(done);
            } catch (e) {
                done(e);
            }
        });
        modem.writeAT(inputCommand);
    });
});

// SETUP

function initialiseModem(): [ModemPort, parsers.Readline] {
    SerialPort.Binding = MockBinding;

    // Create a port and enable echoing of input
    MockBinding.createPort('/dev/PORT', {
        echo: true,
        readyData: Buffer.from([]),
    });
    const modem = new ModemPort('/dev/PORT');
    const modemReadline = modem.pipe(
        new parsers.Readline({ delimiter: '\r\n' })
    );
    return [modem, modemReadline];
}
