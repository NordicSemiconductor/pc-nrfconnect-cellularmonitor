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

export const sendAT =
    (commands: string[], onComplete = () => {}): TAction =>
    (_dispatch, getState) => {
        const uartSerialPort = getUartSerialPort(getState());
        const shellParser = getShellParser(getState());

        if (!shellParser && uartSerialPort) {
            sendCommandLineMode(commands, uartSerialPort, 0, onComplete);
        } else if (shellParser) {
            sendCommandShellMode(commands, shellParser, 0, onComplete);
        } else {
            logger.warn(
                'Tried to send AT command to device, but no serial port is open'
            );
        }
    };
const sendCommandShellMode = (
    commands: string[],
    shellParser: ShellParser,
    counter = 0,
    onComplete = () => {}
) => {
    shellParser.enqueueRequest(
        `at ${commands[counter]}`,
        () => {
            if (counter < commands.length - 1) {
                sendCommandShellMode(
                    commands,
                    shellParser,
                    counter + 1,
                    onComplete
                );
            } else {
                onComplete();
            }
        },
        response => {
            logger.error(
                `${commands[counter]} failed with response=${response}`
            );
            if (counter < commands.length - 1) {
                sendCommandShellMode(
                    commands,
                    shellParser,
                    counter + 1,
                    onComplete
                );
            } else {
                onComplete();
            }
        },
        response => {
            logger.error(
                `${commands[counter]} timed out with response = ${response} `
            );
            if (counter < commands.length - 1) {
                sendCommandShellMode(
                    commands,
                    shellParser,
                    counter + 1,
                    onComplete
                );
            } else {
                onComplete();
            }
        }
    );
};

const sendCommandLineMode = (
    commands: string[],
    serialPort: SerialPort,
    counter = 0,
    onComplete = () => {}
) => {
    sendSingleCommandLineMode(
        `${commands[counter]}`,
        serialPort,
        () => {
            if (counter < commands.length - 1) {
                sendCommandLineMode(
                    commands,
                    serialPort,
                    counter + 1,
                    onComplete
                );
            } else {
                onComplete();
            }
        },
        error => {
            logger.error(`${commands[counter]} failed with response=${error}`);
            if (counter < commands.length - 1) {
                sendCommandLineMode(
                    commands,
                    serialPort,
                    counter + 1,
                    onComplete
                );
            } else {
                onComplete();
            }
        },
        delay => {
            logger.error(
                `${commands[counter]} timed out with after ${delay}ms`
            );
            if (counter < commands.length - 1) {
                sendCommandLineMode(
                    commands,
                    serialPort,
                    counter + 1,
                    onComplete
                );
            } else {
                onComplete();
            }
        }
    );
};

const sendSingleCommandLineMode = (
    command: string,
    serialPort: SerialPort,
    onSuccess: (response: string, command: string) => void,
    onError: (message: string, command: string) => void,
    onTimeout: (delay: number) => void,
    timeoutDelay = 60_000
) => {
    const asyncHandler = new Promise<void>(resolve => {
        let response = '';
        const handler = serialPort.onData(data => {
            response += decoder.decode(data);
            const isCompleteRespose =
                response.includes('OK') || response.includes('ERROR');

            if (isCompleteRespose) {
                resolve();
                clearTimeout(timeout);
                handler();
                if (response.includes('ERROR')) {
                    onError(response, command);
                }
                if (response.includes('OK')) {
                    onSuccess(response, command);
                }
            }
        });

        const timeout = setTimeout(() => {
            resolve();
            handler();
            onTimeout(timeoutDelay);
        }, timeoutDelay);

        serialPort.write(`${command}\r\n`);
    });

    return asyncHandler;
};

const atGetModemVersion = 'AT+CGMR';

export const getModemVersionFromResponse = (response: string) => {
    const versionRegex = /(\d+\.\d+\.\d+)(-FOTA)?/;
    const version = response.match(versionRegex);
    return version ? version[0] : null;
};

export const detectDatabaseVersion = (
    uartSerialPort: SerialPort,
    shellParser: ShellParser | null
) => {
    if (!shellParser && uartSerialPort) {
        return new Promise<string | null>(resolve => {
            sendSingleCommandLineMode(
                atGetModemVersion,
                uartSerialPort,
                response => {
                    resolve(getModemVersionFromResponse(response));
                },
                () => {
                    resolve(null);
                },
                () => {
                    resolve(null);
                },
                1000
            );
        });
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
    let isShellMode = false;
    await sendSingleCommandLineMode(
        'at AT',
        serialPort,
        () => {
            logger.info('Device seem to be in Shell Mode.');
            isShellMode = true;
        },
        () => {},
        () => {}
    );
    return isShellMode;
};
