/* eslint-disable class-methods-use-this */
import ModemPort from '../index';

jest.mock('serialport', () => {
    class MockSerialPort {
        emit = jest.fn();
        write = jest.fn();
        pipe() {
            return { on: jest.fn() };
        }
        prependOnceListener() {
            return this;
        }
    }
    return {
        __esModule: true,
        default: MockSerialPort,
        parsers: {
            Readline: jest.fn().mockImplementation(() => {
                return {};
            }),
        },
    };
});

describe('modem', () => {
    const modem = new ModemPort('some-path');
    it('should provide callback if it is not provided', () => {
        modem.writeAT('command');
        expect(modem.write).toHaveBeenCalledTimes(1);
    });

    it('should write command', () => {
        modem.writeAT('command', jest.fn());
        expect(modem.write).toHaveBeenCalledWith('command\r\n');
    });
});
