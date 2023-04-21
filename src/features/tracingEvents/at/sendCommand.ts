/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger, SerialPort } from 'pc-nrfconnect-shared';

import { TAction } from '../../../utils/thunk';
import { ShellParser } from '../../shell/shellParser';
import { getShellParser, getUartSerialPort } from '../../tracing/traceSlice';

export const sendAT =
    (command: string | string[]): TAction =>
    (_dispatch, getState) => {
        const uartSerialPort = getUartSerialPort(getState());
        const shellParser = getShellParser(getState());

        const commandList = Array.isArray(command) ? command : [command];

        if (!shellParser && uartSerialPort) {
            console.log(`Will run command ${command} in Line Mode`);
            sendCommandLineMode(commandList, uartSerialPort);
        } else if (shellParser) {
            console.log(`Will run command ${command} in Shell Mode`);
            sendCommandShellMode(commandList, shellParser);
        } else {
            logger.warn(
                'Tied to send AT command to device, but no serial port is open'
            );
        }
    };
const sendCommandShellMode = (
    commands: string[],
    shellParser: ShellParser,
    counter = 0
) => {
    shellParser.enqueueRequest(
        `at ${commands[counter]}`,
        () => {
            if (counter < commands.length - 1) {
                sendCommandShellMode(commands, shellParser, counter + 1);
            }
        },
        response => {
            logger.error(
                `${commands[counter]} failed with response=${response}`
            );
            if (counter < commands.length - 1) {
                sendCommandShellMode(commands, shellParser, counter + 1);
            }
        },
        response => {
            logger.error(
                `${commands[counter]} timed out with response = ${response} `
            );
            if (counter < commands.length - 1) {
                sendCommandShellMode(commands, shellParser, counter + 1);
            }
        }
    );
};

const sendCommandLineMode = (
    commands: string | string[],
    serialPort: SerialPort
) => {
    let commandIndex = 0;
    let response = '';
    const decoder = new TextDecoder();
    const handler = serialPort.onData(data => {
        response += decoder.decode(data);
        const doCompare = response.endsWith('\r\n');
        const doContinue =
            (doCompare && response.includes('OK')) ||
            response.includes('ERROR');
        if (doContinue) {
            commandIndex += 1;

            if (commandIndex < commands.length) {
                serialPort.write(`${commands[commandIndex]} \r\n`);
            } else {
                // Cleanup when all commands have been sent.
                handler();
            }
            response = '';
        }
    });

    serialPort.write(`${commands[commandIndex]} \r\n`);
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
        const decoder = new TextDecoder();
        const responsePromise = new Promise<string | null>(resolve => {
            let response = '';
            const handler = uartSerialPort.onData(data => {
                response += decoder.decode(data);
                const responseComplete =
                    (response.endsWith('\r\n') && response.includes('OK')) ||
                    response.includes('ERROR');

                if (responseComplete) {
                    if (response.includes('ERROR')) {
                        logger.warn(
                            `Error when getting modem version: "${response}"`
                        );
                        resolve(null);
                    } else {
                        resolve(getModemVersionFromResponse(response));
                    }
                    handler();
                    clearTimeout(timeout);
                }
            });
            const timeout = setTimeout(() => {
                handler();
                logger.warn(
                    'Timed out while getting modem version from AT command'
                );
                resolve(null);
            }, 1500);
        });

        uartSerialPort.write(`${atGetModemVersion} \r\n`);

        return responsePromise;
    }

    if (shellParser) {
        return new Promise<string | null>(resolve => {
            shellParser.enqueueRequest(
                `at ${atGetModemVersion} `,
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

export const testIfShellMode = (serialPort: SerialPort) =>
    new Promise<boolean>(resolve => {
        const decoder = new TextDecoder();
        let response = '';
        const handler = serialPort.onData(data => {
            response += decoder.decode(data);
            const doCompare =
                response.includes('OK') || response.includes('ERROR');
            if (doCompare) {
                console.log('response to compare:', response);
                if (response.includes('OK')) {
                    logger.info('Device seem to be in Shell Mode');
                    resolve(true);
                } else if (response.includes('ERROR')) {
                    logger.info('Device seem to be in Line Mode');
                    resolve(false);
                }
                handler();
                clearTimeout(timeout);
                handler();
            }
        });

        const timeout = setTimeout(() => {
            handler();
            logger.warn(
                'Could not determine if Device is in shell mode or not'
            );
            resolve(false);
        }, 1000);

        serialPort.write('at AT\r\n');
    });
