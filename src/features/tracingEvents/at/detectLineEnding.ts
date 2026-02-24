/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { SerialPort } from '@nordicsemiconductor/pc-nrfconnect-shared';

const decoder = new TextDecoder();

type LineEnding = '\r' | '\n' | '\r\n';

// todo: reset it every time device is changed;
let LINE_MODE_DELIMITER: LineEnding = '\r\n';

/**
 * Helper: Sends raw data and waits for a response or a timeout.
 * Does NOT append LineEnding automatically
 * and does NOT reject on ERROR (since ERROR is a valid logic path here).
 *
 * @param {string} data - The raw data to send (e.g., "AT\r" or "\n")
 * @param {SerialPort} serialPort - The serial port to use for communication
 * @param {number} timeoutMs - Timeout in milliseconds to wait for a response (default: 1000ms)
 *
 * @returns {Promise<string>} Resolves with OK or ERROR, otherwise rejects with 'TIMEOUT'.
 */
const sendRawWithTimeout = (
    data: string,
    serialPort: SerialPort,
    timeoutMs: number = 1000, // todo: check if need to wait more
): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        let response = '';
        let timer: NodeJS.Timeout | null = null;

        const cleanup = () => {
            if (timer) clearTimeout(timer);
            unsubscribe();
        };

        const unsubscribe = serialPort.onData(chunk => {
            response += decoder.decode(chunk);
            const isCompleteResponse =
                response.includes('OK') || response.includes('ERROR');

            if (isCompleteResponse) {
                cleanup();
                resolve(response);
            }
        });

        serialPort.write(data);

        timer = setTimeout(() => {
            cleanup();
            reject(new Error('TIMEOUT'));
        }, timeoutMs);
    });

export const detectLineEnding = async (
    serialPort: SerialPort,
): Promise<LineEnding> => {
    let detectedEnding: LineEnding | null = null;

    try {
        // --- Step 1: Send "AT<CR>"
        const responseCR = await sendRawWithTimeout('AT\r', serialPort);

        if (responseCR.includes('OK')) {
            detectedEnding = '\r';
        } else if (responseCR.includes('ERROR')) {
            // Received ERROR on AT<CR>, defaulting to <CR> as requested.
            detectedEnding = '\r';
        }
    } catch (error) {
        // Timeout on AT<CR>, proceeding to send <LF>
        if ((error as Error).message === 'TIMEOUT') {
            try {
                // --- Step 2: Send "<LF>" and wait 1s ---
                // Note: The device has effectively received "AT\r" + "\n" now
                const response2 = await sendRawWithTimeout('\n', serialPort);

                if (response2.includes('OK')) {
                    detectedEnding = '\r\n';
                } else if (response2.includes('ERROR')) {
                    // Logic: "Response ERROR: Line ending is <LF>"
                    detectedEnding = '\n';
                }
            } catch (innerError) {
                if ((innerError as Error).message === 'TIMEOUT') {
                    throw new Error(
                        'Device not responding to line ending detection.',
                    );
                }
                throw innerError;
            }
        } else {
            throw error;
        }
    }

    if (!detectedEnding) {
        throw new Error('Could not determine line ending.');
    }

    const confirmation = await sendRawWithTimeout(
        `AT${detectedEnding}`,
        serialPort,
    );

    if (confirmation.includes('OK')) {
        LINE_MODE_DELIMITER = detectedEnding;
        return detectedEnding;
    }

    throw new Error(
        `Line ending confirmation failed. Received: ${confirmation}`,
    );
};

export function getGlobalLineModeDelimiter() {
    console.info(
        'LINE_MODE_DELIMITER from getter',
        JSON.stringify(LINE_MODE_DELIMITER),
    );
    return LINE_MODE_DELIMITER;
}

export function setGlobalLineModeDelimiter(delimiter: LineEnding) {
    LINE_MODE_DELIMITER = delimiter;
}
