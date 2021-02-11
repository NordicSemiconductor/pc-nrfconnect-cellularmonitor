// import Serialport, { parsers } from 'serialport';

import ModemPort from '../index';

describe('modem', () => {
    const modem = new ModemPort('some-path');
    it('should append callback to the AT command if not provided', () => {
        modem.writeAT('command')?.then(data => console.log(data));
        // expect(ModemPort.ping()).toBe('pong');
    });
});
