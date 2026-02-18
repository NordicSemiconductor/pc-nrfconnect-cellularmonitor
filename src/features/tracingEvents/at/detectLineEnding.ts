import { SerialPort } from '@nordicsemiconductor/pc-nrfconnect-shared';
const decoder = new TextDecoder();

type LineEnding = '\r' | '\n' | '\r\n';

/**
 * Helper: Sends raw data and waits for a response or a timeout.
 * Unlike the original function, this does NOT append \r\n automatically
 * and does NOT reject on ERROR (since ERROR is a valid logic path here).
 */
const sendRawWithTimeout = (data: string, timeoutMs: number = 1000, serialPort: SerialPort) =>
    new Promise<string>((resolve, reject) => {
        let response = '';
        let timer: any;

        const cleanup = () => {
            if (timer) clearTimeout(timer);
            unsubscribe();
        };

        // Set up the data listener (reusing your pattern)
        const unsubscribe = serialPort.onData(chunk => {
            response += decoder.decode(chunk);
            const isCompleteResponse = response.includes('OK') || response.includes('ERROR');

            if (isCompleteResponse) {
                cleanup();
                resolve(response);
            }
        });

        // Write the data
        serialPort.write(data);

        // Setup timeout
        timer = setTimeout(() => {
            cleanup();
            reject(new Error('TIMEOUT'));
        }, timeoutMs);
    });

export const detectLineEnding = async (serialPort: SerialPort): Promise<LineEnding> => {
    let detectedEnding: LineEnding | null = null;

    try {
        // --- Step 1: Send "AT<CR>" and wait 1s ---
        console.log('Attempting detection: Sending AT<CR>');
        const response1 = await sendRawWithTimeout('AT\r', 1000, serialPort);

        if (response1.includes('OK')) {
            detectedEnding = '\r';
        } else if (response1.includes('ERROR')) {
            // Logic: "FATAL ERROR but try line ending <CR>"
            console.warn('Received ERROR on AT<CR>, defaulting to <CR> as requested.');
            detectedEnding = '\r';
        }

    } catch (error: any) {
        // If Step 1 timed out, we proceed to Step 2
        if (error.message === 'TIMEOUT') {
            console.log('Timeout on AT<CR>, proceeding to send <LF>');

            try {
                // --- Step 2: Send "<LF>" and wait 1s ---
                // Note: The device has effectively received "AT\r" + "\n" now
                const response2 = await sendRawWithTimeout('\n', 1000, serialPort);

                if (response2.includes('OK')) {
                    detectedEnding = '\r\n';
                } else if (response2.includes('ERROR')) {
                    // Logic: "Response ERROR: Line ending is <LF>"
                    detectedEnding = '\n';
                }

            } catch (innerError: any) {
                // --- Step 3: No response ---
                if (innerError.message === 'TIMEOUT') {
                    throw new Error('FATAL ERROR: Device not responding to line ending detection.');
                }
                throw innerError;
            }
        } else {
            throw error;
        }
    }

    if (!detectedEnding) {
        throw new Error('FATAL ERROR: Could not determine line ending.');
    }

    // --- Step 4: Confirm correct line ending ---
    console.log(`Detected candidate: ${JSON.stringify(detectedEnding)}. Verifying...`);
    try {
        const confirmation = await sendRawWithTimeout(`AT${detectedEnding}`, 1000, serialPort);
        if (confirmation.includes('OK')) {
            console.log('Line ending confirmed.');
            return detectedEnding;
        } else {
            throw new Error(`Confirmation failed. Received: ${confirmation}`);
        }
    } catch (e) {
        throw new Error(`FATAL ERROR during confirmation: ${e}`);
    }
};
