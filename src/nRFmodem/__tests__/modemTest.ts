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
    it('should append callback to the AT command if not provided', () => {
        const result = modem.writeAT('command');
        expect(result).toBe(Promise);
    });
});
