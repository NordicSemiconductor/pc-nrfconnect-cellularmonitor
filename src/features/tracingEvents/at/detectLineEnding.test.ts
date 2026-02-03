import { detectLineEnding } from './detectLineEnding';

// ------------------------------------------------------------------
// 1. Mocks and Setup
// ------------------------------------------------------------------

// We need a custom mock to simulate the SerialPort behavior manually
class MockSerialPort {
    callback: ((data: Buffer) => void) | null = null;
    writeBuffer: string[] = [];

    // Simulate .onData subscription
    onData(cb: (data: Buffer) => void) {
        this.callback = cb;
        // Return unsubscribe function
        return () => {
            this.callback = null;
        };
    }

    // Simulate .write
    write(data: string) {
        this.writeBuffer.push(data);
    }

    // Helper for Test: Simulate device sending data back
    emitData(data: string) {
        if (this.callback) {
            this.callback(Buffer.from(data));
        }
    }

    // Helper for Test: Clear the write buffer to verify next steps
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
        jest.useFakeTimers(); // Take control of setTimeout
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    // ------------------------------------------------------------------
    // 2. Success Scenarios (Happy Paths)
    // ------------------------------------------------------------------

    test('Should detect <CR> when AT<CR> returns OK', async () => {
        const promise = detectLineEnding(mockPort);

        // 1. Logic sends AT<CR>
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // 2. Device responds OK
        mockPort.emitData('OK');

        // 3. Logic should now send Confirmation: AT<CR>
        // We need to wait a tick for the promise chain to proceed
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // 4. Confirmation succeeds
        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\r');
    });

    test('Should detect <CRLF> when AT<CR> times out, then <LF> returns OK', async () => {
        const promise = detectLineEnding(mockPort);

        // 1. Logic sends AT<CR>
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // 2. TIMEOUT (Simulate 1s passing)
        jest.advanceTimersByTime(1000);

        // 3. Logic should send <LF> (Resulting in device seeing AT\r\n)
        await Promise.resolve(); // Allow catch block to execute
        expect(mockPort.getLastWrite()).toBe('\n');

        // 4. Device responds OK (implies it liked the full sequence)
        mockPort.emitData('OK');

        // 5. Logic sends Confirmation: AT<CRLF>
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r\n');

        // 6. Confirmation succeeds
        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\r\n');
    });

    test('Should detect <LF> when AT<CR> times out, then <LF> returns ERROR', async () => {
        const promise = detectLineEnding(mockPort);

        // 1. Logic sends AT<CR>
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // 2. TIMEOUT
        jest.advanceTimersByTime(1000);

        // 3. Logic sends <LF>
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('\n');

        // 4. Device responds ERROR
        // (Logic rule: "Response ERROR: Line ending is <LF>")
        mockPort.emitData('ERROR');

        // 5. Logic sends Confirmation: AT<LF>
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\n');

        // 6. Confirmation succeeds
        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\n');
    });

    // ------------------------------------------------------------------
    // 3. Edge Case / Failure Scenarios
    // ------------------------------------------------------------------

    test('Should fallback to <CR> (Fatal Error check) when AT<CR> returns ERROR', async () => {
        const promise = detectLineEnding(mockPort);

        // 1. Logic sends AT<CR>
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // 2. Device responds ERROR immediately
        // (Logic rule: "FATAL ERROR but try line ending <CR>")
        mockPort.emitData('ERROR');

        // 3. Logic sends Confirmation: AT<CR>
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // 4. Confirmation succeeds
        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\r');
    });

    test('Should throw FATAL ERROR if both AT<CR> and <LF> time out', async () => {
        const promise = detectLineEnding(mockPort);

        // 1. Logic sends AT<CR>
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // 2. TIMEOUT 1
        jest.advanceTimersByTime(1000);

        // 3. Logic sends <LF>
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('\n');

        // 4. TIMEOUT 2
        jest.advanceTimersByTime(1000);

        // Expect rejection
        await expect(promise).rejects.toThrow('FATAL ERROR: Device not responding');
    });

    test('Should throw FATAL ERROR if Confirmation step fails (Returns ERROR)', async () => {
        const promise = detectLineEnding(mockPort);

        // 1. Detect <CR> successfully
        mockPort.emitData('OK');

        // 2. Logic sends Confirmation AT<CR>
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // 3. Confirmation fails!
        mockPort.emitData('ERROR');

        await expect(promise).rejects.toThrow('Confirmation failed');
    });

    test('Should throw FATAL ERROR if Confirmation step fails (Timeout)', async () => {
        const promise = detectLineEnding(mockPort);

        // 1. Detect <CR> successfully
        mockPort.emitData('OK');
        await Promise.resolve();

        // 2. Logic waiting for Confirmation... TIMEOUT
        jest.advanceTimersByTime(1000);

        await expect(promise).rejects.toThrow('TIMEOUT');
    });

    test('Should handle fragmented data chunks correctly', async () => {
        const promise = detectLineEnding(mockPort);

        // Logic sends AT<CR>
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // Send 'O' then 'K' separately
        mockPort.emitData('O');
        mockPort.emitData('K');

        // Check Confirmation
        await Promise.resolve();
        expect(mockPort.getLastWrite()).toBe('AT\r');

        // Confirm
        mockPort.emitData('OK');

        const result = await promise;
        expect(result).toBe('\r');
    });
});
