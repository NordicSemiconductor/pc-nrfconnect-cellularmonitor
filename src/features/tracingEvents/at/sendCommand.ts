/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger, SerialPort } from 'pc-nrfconnect-shared';

import { TAction } from '../../../utils/thunk';
import { ShellParser } from '../../shell/shellParser';
import { getShellParser, getUartSerialPort } from '../../tracing/traceSlice';

const decoder = new TextDecoder();
const queue: string[] = [];

export const sendAT =
    (commands: string | string[]): TAction =>
    async (_dispatch, getState) => {
        const uartSerialPort = getUartSerialPort(getState());
        const shellParser = getShellParser(getState());

        const commandList = Array.isArray(commands) ? commands : [commands];

        queue.push(...commandList);

        if (queue.length > commandList.length) {
            // Something is already processing the queue, exit early
            return;
        }

        if (!shellParser && uartSerialPort) {
            await sendCommandLineMode(uartSerialPort);
        } else if (shellParser) {
            await sendCommandShellMode(shellParser);
        } else {
            logger.warn(
                'Tried to send AT command to device, but no serial port is open'
            );
        }
    };

const sendCommandShellMode = async (shellParser: ShellParser) => {
    do {
        const command = queue.shift();
        // eslint-disable-next-line no-await-in-loop
        await shellParser.enqueueRequest(
            `at ${command}`,
            () => {},
            () => {},
            () => {}
        );
    } while (queue.length);
};

const sendCommandLineMode = async (serialPort: SerialPort) => {
    do {
        const command = queue.shift();
        console.log(
            `Processing the ${command} command. ${queue.length} left to go`
        );

        try {
            // eslint-disable-next-line no-await-in-loop
            await sendSingleCommandLineMode(command!, serialPort);
        } catch (error) {
            logger.error(`AT command ${command} failed: ${error}`);
        }
    } while (queue.length);
};

const sendSingleCommandLineMode = (
    command: string,
    serialPort: SerialPort,
    timeoutDelay = 60_000
) =>
    new Promise<string>((resolve, reject) => {
        let response = '';
        const handler = serialPort.onData(data => {
            response += decoder.decode(data);
            const isCompleteRespose =
                response.includes('OK') || response.includes('ERROR');

            if (isCompleteRespose) {
                clearTimeout(timeout);
                handler();
                if (response.includes('ERROR')) {
                    reject(response);
                }
                if (response.includes('OK')) {
                    resolve(response);
                }
            }
        });

        const timeout = setTimeout(() => {
            handler();
            reject(new Error(`${command} timed out after ${timeoutDelay}ms`));
        }, timeoutDelay);

        serialPort.write(`${command}\r\n`);
    });

const atGetModemVersion = 'AT+CGMR';

export const getModemVersionFromResponse = (response: string) => {
    const versionRegex = /(\d+\.\d+\.\d+)(-FOTA)?/;
    const version = response.match(versionRegex);
    return version ? version[0] : null;
};

export const detectDatabaseVersion = async (
    uartSerialPort: SerialPort,
    shellParser: ShellParser | null
) => {
    if (!shellParser && uartSerialPort) {
        try {
            const modemVersionResponse = await sendSingleCommandLineMode(
                atGetModemVersion,
                uartSerialPort,
                1000
            );
            return getModemVersionFromResponse(modemVersionResponse);
        } catch (error) {
            logger.debug(
                `Failed to auto detect modem version using ${atGetModemVersion}: (${error})`
            );
            return null;
        }
    }

    if (shellParser) {
        if (shellParser.isPaused()) {
            shellParser.unPause();
        }
        return new Promise<string | null>(resolve => {
            shellParser.enqueueRequest(
                `at ${atGetModemVersion}`,
                (response: string) => {
                    resolve(getModemVersionFromResponse(response));
                },
                error => {
                    logger.warn(
                        `Error while requesting modem firmware version: "${error}"`
                    );
                    resolve(null);
                },
                timeout => {
                    logger.warn(
                        `Timed out while requesting modem firmware version: "${timeout}"`
                    );
                    resolve(null);
                }
            );
        });
    }

    return null as never;
};

export const testIfShellMode = async (serialPort: SerialPort) => {
    try {
        await sendSingleCommandLineMode('at AT', serialPort, 2000);
        return true;
    } catch (error) {
        return false;
    }
};
