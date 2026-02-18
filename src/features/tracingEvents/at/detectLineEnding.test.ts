import { detectLineEnding } from './detectLineEnding';

class MockSerialPort {
    callback: ((data: Buffer) => void) | null = null;
    writeBuffer: string[] = [];

    onData(cb: (data: Buffer) => void) {
        this.callback = cb;
        // Return unsubscribe function
        return () => {
            this.callback = null;
        };
    }

    write(data: string) {
        this.writeBuffer.push(data);
    }

    emitData(data: string) {
        if (this.callback) {
            this.callback(Buffer.from(data));
        }
    }

    clearBuffer() {
        this.writeBuffer = [];
    }

    getLastWrite() {
        return this.writeBuffer[this.writeBuffer.length - 1];
    }
}

describe('detectLineEnding', () => {
    let mockPort: any;

    beforeAll(() => {
        // Ensure TextDecoder is available in the test environment (Node/JSDOM)
        if (typeof TextDecoder === 'undefined') {
            (global as any).TextDecoder = require('util').TextDecoder;
        }
    });

    beforeEach(() => {
        mockPort = new MockSerialPort();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('Should detect <CR> when AT<CR> returns OK', async () => {
        const promise = detectLineEnding(mockPort);

        expect(mockPort.getLastWrite()).toBe('AT\r');

        mockPort.emitData('OK');

        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r');

        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\r');
    });

    test('Should detect <CRLF> when AT<CR> times out, then <LF> returns OK', async () => {
        const promise = detectLineEnding(mockPort);

        expect(mockPort.getLastWrite()).toBe('AT\r');

        jest.advanceTimersByTime(1000);

        await Promise.resolve(); // Allow catch block to execute
        expect(mockPort.getLastWrite()).toBe('\n');

        mockPort.emitData('OK');

        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r\n');

        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\r\n');
    });

    test('Should detect <LF> when AT<CR> times out, then <LF> returns ERROR', async () => {
        const promise = detectLineEnding(mockPort);

        expect(mockPort.getLastWrite()).toBe('AT\r');

        jest.advanceTimersByTime(1000);

        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('\n');

        // logic rule: "Response ERROR: Line ending is <LF>"
        mockPort.emitData('ERROR');

        // logic sends Confirmation: AT<LF>
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\n');

        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\n');
    });

    // failure cases:
    test('Should fallback to <CR> (Fatal Error check) when AT<CR> returns ERROR', async () => {
        const promise = detectLineEnding(mockPort);

        expect(mockPort.getLastWrite()).toBe('AT\r');

        // logic rule: "FATAL ERROR but try line ending <CR>"
        mockPort.emitData('ERROR');

        // logic sends Confirmation: AT<CR>
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r');

        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\r');
    });

    test('Should throw FATAL ERROR if both AT<CR> and <LF> time out', async () => {
        const promise = detectLineEnding(mockPort);

        expect(mockPort.getLastWrite()).toBe('AT\r');

        jest.advanceTimersByTime(1000);

        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('\n');

        jest.advanceTimersByTime(1000);

        await expect(promise).rejects.toThrow('FATAL ERROR: Device not responding');
    });

    test('Should throw FATAL ERROR if Confirmation step fails (Returns ERROR)', async () => {
        const promise = detectLineEnding(mockPort);

        mockPort.emitData('OK');

        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r');

        mockPort.emitData('ERROR');

        await expect(promise).rejects.toThrow('Confirmation failed');
    });

    test('Should throw FATAL ERROR if Confirmation step fails (Timeout)', async () => {
        const promise = detectLineEnding(mockPort);

        mockPort.emitData('OK');
        await Promise.resolve();

        jest.advanceTimersByTime(1000);

        await expect(promise).rejects.toThrow('TIMEOUT');
    });

    test('Should handle fragmented data chunks correctly', async () => {
        const promise = detectLineEnding(mockPort);

        expect(mockPort.getLastWrite()).toBe('AT\r');

        // send 'O' then 'K' separately
        mockPort.emitData('O');
        mockPort.emitData('K');

        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r');

        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\r');
    });
});
