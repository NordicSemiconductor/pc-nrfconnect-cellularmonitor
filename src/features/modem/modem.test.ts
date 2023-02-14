/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { MockBinding } from '@serialport/binding-mock';
import { SerialPortStream as MockSerialPortStream } from '@serialport/stream';
import { SerialPort } from 'serialport';

import { createModem, Modem } from './modem';

const testPortPath = '/dev/PORT';

jest.mock('serialport', () => {
    const MockSerialPort = new Proxy(MockSerialPortStream, {
        construct(Target, args) {
            const [options] = args;
            return new Target({
                path: testPortPath,
                binding: MockBinding,
                ...options,
            });
        },
    });
    return {
        SerialPort: MockSerialPort,
    };
});

describe('modem', () => {
    beforeEach(() => {
        // Cleanup between each test.
        MockBinding.reset();
        MockBinding.createPort(testPortPath, {
            echo: true,
            record: true,
        });
    });

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

function initialiseModem(): [Modem, SerialPort] {
    const serialPort = new SerialPort({ path: testPortPath, baudRate: 9600 });
    return [createModem(serialPort), serialPort];
}
