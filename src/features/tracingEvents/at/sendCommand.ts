/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger, SerialPort } from 'pc-nrfconnect-shared';

import { TAction } from '../../../utils/thunk';
import { ShellParser } from '../../shell/shellParser';
import {
    getShellParser,
    getTerminalSerialPort,
} from '../../terminal/serialPortSlice';
import { setIsSendingATCommands } from '../../tracing/traceSlice';

const decoder = new TextDecoder();
const queue: string[] = [];

export const clearATQueue = () => queue.splice(0, queue.length);

export const sendAT =
    (commands: string | string[]): TAction =>
    async (dispatch, getState) => {
        const uartSerialPort = getTerminalSerialPort(getState());
        const shellParser = getShellParser(getState());

        const commandList = Array.isArray(commands) ? commands : [commands];

        queue.push(...commandList);

        if (queue.length > commandList.length) {
            // Something is already processing the queue, exit early
            return;
        }

        dispatch(setIsSendingATCommands(true));
        if (!shellParser && uartSerialPort) {
            await sendCommandLineMode(uartSerialPort);
        } else if (shellParser) {
            await sendCommandShellMode(shellParser);
        } else {
            logger.warn(
                'Tried to send AT command to device, but no serial port is open'
            );
        }
        dispatch(setIsSendingATCommands(false));
    };

const sendCommandShellMode = async (shellParser: ShellParser) => {
    do {
        const command = queue.shift();
        // eslint-disable-next-line no-await-in-loop
        await shellParser.enqueueRequest(`at ${command}`, {
            onSuccess: () => {},
            onError: err => {
                console.error('There was an error', err);
            },
            onTimeout: () => {},
        });
    } while (queue.length);
};

const sendCommandLineMode = async (serialPort: SerialPort) => {
    do {
        const [command] = queue;

        try {
            // eslint-disable-next-line no-await-in-loop
            await sendSingleCommandLineMode(command, serialPort);
        } catch (error) {
            logger.error(`AT command ${command} failed: ${error}`);
        }
        queue.shift();
    } while (queue.length);
};

const sendSingleCommandLineMode = (command: string, serialPort: SerialPort) =>
    new Promise<string>((resolve, reject) => {
        let response = '';
        const handler = serialPort.onData(data => {
            response += decoder.decode(data);
            const isCompleteRespose =
                response.includes('OK') || response.includes('ERROR');
            if (isCompleteRespose) {
                handler();
                if (response.includes('ERROR')) {
                    reject(response);
                }
                if (response.includes('OK')) {
                    resolve(response);
                }
            }
        });

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
    if (queue.length) {
        logger.info(
            'Device is busy, skipping fast modem firmware version check'
        );
        return;
    }

    if (!shellParser && uartSerialPort) {
        try {
            const modemVersionResponse = await sendSingleCommandLineMode(
                atGetModemVersion,
                uartSerialPort
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
            shellParser.enqueueRequest(`at ${atGetModemVersion}`, {
                onSuccess: (response: string) => {
                    resolve(getModemVersionFromResponse(response));
                },
                onError: error => {
                    logger.warn(
                        `Error while requesting modem firmware version: "${error}"`
                    );
                    resolve(null);
                },
                onTimeout: timeout => {
                    logger.warn(
                        `Timed out while requesting modem firmware version: "${timeout}"`
                    );
                    resolve(null);
                },
            });
        });
    }

    return null as never;
};

export const sendSingleCommand = async (
    uartSerialPort: SerialPort | null,
    shellParser: ShellParser | null,
    command: string
) => {
    if (queue.length) {
        logger.info('Device is busy.');
        return;
    }

    if (!shellParser && uartSerialPort) {
        try {
            return await sendSingleCommandLineMode(command, uartSerialPort);
        } catch (error) {
            logger.debug(
                `Failed to execute the AT command: ${command}: (${error})`
            );
            return null;
        }
    }

    if (shellParser) {
        if (shellParser.isPaused()) {
            shellParser.unPause();
        }
        return new Promise<string | null>(resolve => {
            shellParser.enqueueRequest(`at ${command}`, {
                onSuccess: (response: string) => {
                    resolve(getModemVersionFromResponse(response));
                },
                onError: error => {
                    logger.warn(`"${error}"`);
                    resolve(null);
                },
                onTimeout: timeout => {
                    logger.warn(
                        `Timed out while executing command: "${timeout}"`
                    );
                    resolve(null);
                },
            });
        });
    }

    return null as never;
};

export const testIfShellMode = async (serialPort: SerialPort) => {
    try {
        await sendSingleCommandLineMode('at AT', serialPort);
        logger.info('Device is in shell mode.');
        return true;
    } catch (error) {
        logger.info('Device is in line mode.');
        return false;
    }
};
