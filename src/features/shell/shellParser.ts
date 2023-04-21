/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';
import { SerialPort } from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

interface ICallbacks {
    onSuccess: (response: string, command: string) => void;
    onError: (message: string, command: string) => void;
    onTimeout?: (message: string, command: string) => void;
}

export type ShellParserSettings = {
    shellPromptUart: string;
    logRegex: RegExp;
    errorRegex: RegExp;
    timeout: number;
};

type CommandEnqueue = {
    command: string;
    callbacks: ICallbacks[];
    sent: boolean;
    sentTime: number;
};

export type ShellParser = Awaited<ReturnType<typeof hookModemToShellParser>>;
export type XTerminalShellParser = ReturnType<
    typeof xTerminalShellParserWrapper
>;

export const xTerminalShellParserWrapper = (terminal: Terminal) => ({
    getTerminalData: () => {
        let out = '';
        for (let i = 0; i <= terminal.buffer.active.cursorY; i += 1) {
            const line = terminal.buffer.active.getLine(i);
            if (typeof line !== 'undefined') {
                out += `\r\n${line.translateToString()}`;
            }
        }

        return out.trim();
    },
    clear: () => terminal.clear(),
    getLastLine: () => {
        const lastLine = terminal.buffer.active.getLine(
            terminal.buffer.active.cursorY
        );
        if (typeof lastLine === 'undefined') {
            return '';
        }

        return lastLine.translateToString().trim();
    },
    write: (data: string, callback: () => void | undefined) =>
        terminal.write(data, callback),
});

export const hookModemToShellParser = async (
    serialPort: SerialPort,
    xTerminalShellParser: XTerminalShellParser,
    settings: ShellParserSettings = {
        shellPromptUart: 'uart:~$',
        logRegex:
            /[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): /,
        errorRegex: /Error /,
        timeout: 1000,
    },
    shellEchos = true
) => {
    const eventEmitter = new EventEmitter();

    let commandBuffer = '';
    let commandQueueCallbacks = new Map<string, ICallbacks[]>();
    let commandQueue: CommandEnqueue[] = [];
    let cr = false;
    let crnl = false;
    let pausedState = true; // Assume we have some command in the shell that has user has started typing

    // init shell mode

    if (await serialPort.isOpen()) {
        serialPort.write(
            `${String.fromCharCode(12).toString()}${String.fromCharCode(
                21
            ).toString()}`
        );
    }

    const reset = () => {
        commandBuffer = '';
        commandQueueCallbacks = new Map();
        commandQueue = [];
        xTerminalShellParser.clear();
        cr = false;
        crnl = false;
    };

    const initDataSend = async () => {
        if (!(await serialPort.isOpen())) return;
        if (pausedState) return; // user is typing

        sendCommands();
    };

    const sendCommands = () => {
        if (commandQueue.length > 0 && canProcess()) {
            const command = commandQueue[0];
            if (command && !command.sent) {
                serialPort.write(`${command.command}\r\n`);
                command.sent = true;
                command.sentTime = Date.now();
                const t = setTimeout(() => {
                    const elapsedTime = Date.now() - command.sentTime;
                    command.callbacks.forEach(callback => {
                        if (callback.onTimeout)
                            callback.onTimeout(
                                `Callback timeout after ${elapsedTime}ms`,
                                command.command
                            );
                    });

                    commandQueue.shift();
                    sendCommands();
                }, settings.timeout);
                command.callbacks.push({
                    onSuccess: () => clearTimeout(t),
                    onError: () => clearTimeout(t),
                });
            }
        }
    };

    const parseShellCommands = (data: string, endToken: string) => {
        // Buffer does not have the end token hence we have to consider the response
        // to still have pending bytes hence we need to wait more.
        if (data.indexOf(endToken.trim()) !== -1) {
            const responseFromShell = data.split(endToken.trim());
            responseFromShell.forEach((response, index) => {
                if (index === responseFromShell.length - 1) return;

                if (response.trim().length === 0 && response !== '\r\n') return;

                responseCallback(response.trimStart());
            });

            // Incomplete command leave it for future processing
            const remainingCommandPart = responseFromShell.pop();
            if (remainingCommandPart && remainingCommandPart.length > 0) {
                return remainingCommandPart;
            }

            return '';
        }

        return data;
    };

    const responseCallback = (response: string) => {
        let callbackFound = false;

        response = response.trim();

        if (bufferedDataWrittenData.includes('\r')) {
            const splitDataWrittenData = bufferedDataWrittenData
                .split('\r')
                .filter(v => v.trim() !== '');

            if (splitDataWrittenData) {
                response = `${
                    splitDataWrittenData[0]?.trim() ?? ''
                }\r\n${response}`;

                bufferedDataWrittenData = splitDataWrittenData
                    .splice(1)
                    .join('\r');
            } else {
                bufferedDataWrittenData = '';
            }
        }

        // Trigger one time callbacks
        if (commandQueue.length > 0) {
            const regex = `^(${commandQueue[0].command.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            )})`;

            // we need to replace \r and \n as shell might add \r \n when shell wraps
            const matched = response
                .replaceAll('\r', '')
                .replaceAll('\n', '')
                .match(regex);
            if (matched && commandQueue[0].sent) {
                const command = commandQueue[0].command;
                const commandResponse = response.replace(command, '').trim();
                if (commandResponse.match(settings.errorRegex)) {
                    commandQueue[0].callbacks.forEach(callback =>
                        callback.onError(commandResponse, command)
                    );
                    callbackFound = true;
                } else {
                    commandQueue[0].callbacks.forEach(callback =>
                        callback.onSuccess(commandResponse, command)
                    );
                    callbackFound = true;
                }

                commandQueue.shift();

                serialPort.isOpen().then(isOpen => {
                    if (isOpen && commandQueue.length > 0 && !pausedState) {
                        sendCommands();
                    }
                });
            }
        }

        // Trigger permanent time callbacks
        commandQueueCallbacks.forEach((callbacks, key) => {
            const commandMatch = response.match(`^(${key})`);
            if (commandMatch) {
                const commandResponse = response
                    .replace(new RegExp(`^(${key})\r\n`), '')
                    .trim();
                const match = commandResponse.match(settings.errorRegex);
                if (match) {
                    callbacks.forEach(callback => {
                        callback.onError(commandResponse, commandMatch[0]);
                    });
                } else {
                    callbacks.forEach(callback => {
                        callback.onSuccess(commandResponse, commandMatch[0]);
                    });
                }

                callbackFound = true;
            }
        });

        if (!callbackFound && response !== '') {
            eventEmitter.emit('unknownCommand', response);
        }
    };

    const loadToBuffer = (newline: boolean) => {
        commandBuffer = `${commandBuffer}${xTerminalShellParser.getTerminalData()}${
            newline ? '\r\n' : ''
        }`;
        xTerminalShellParser.clear();

        if (commandBuffer.match(settings.logRegex)) {
            eventEmitter.emit('shellLogging', commandBuffer.trim());
            commandBuffer = '';
            return;
        }

        if (commandBuffer === settings.shellPromptUart) {
            commandBuffer = '';
        }
    };

    const processBuffer = () => {
        if (!canProcess()) {
            return;
        }

        loadToBuffer(false);

        commandBuffer = parseShellCommands(
            commandBuffer,
            settings.shellPromptUart
        );

        xTerminalShellParser.clear();
    };

    const unregisterOnClosed = serialPort.onClosed(() => {
        loadToBuffer(false);

        commandBuffer += settings.shellPromptUart;

        commandBuffer = parseShellCommands(
            commandBuffer,
            settings.shellPromptUart
        );

        xTerminalShellParser.clear();
    });

    const processSerialData = (data: Uint8Array) => {
        data.forEach((byte, index) => {
            cr = byte === 13 || (cr && byte === 10);
            crnl = cr && byte === 10;

            const callback = crnl ? () => loadToBuffer(true) : processBuffer;

            xTerminalShellParser.write(String.fromCharCode(byte), () => {
                if (index + 1 === data.length) updateIsPaused();
                callback();
            });
        });
    };

    // Hook to listen to all modem data
    const unregisterOnResponse = serialPort.onData(processSerialData);

    let bufferedDataWrittenData = '';
    const unregisterOnDataWritten = serialPort.onDataWritten(data => {
        if (!shellEchos) {
            bufferedDataWrittenData += Buffer.from(data).toString();
            bufferedDataWrittenData.replaceAll('\r\n', '\r');
        }

        if (!pausedState) {
            eventEmitter.emit('pausedChanged', true);
        }

        updateIsPaused();
    });

    const canProcess = () =>
        xTerminalShellParser.getLastLine() === settings.shellPromptUart &&
        (bufferedDataWrittenData === '' ||
            bufferedDataWrittenData.endsWith('\r')) !== null;

    const updateIsPaused = () => {
        const shellPaused = !canProcess();
        if (pausedState !== shellPaused) {
            pausedState = shellPaused;
            eventEmitter.emit('pausedChanged', pausedState);
        }
        if (!shellPaused) sendCommands();
    };

    updateIsPaused();

    return {
        onPausedChange: (handler: (state: boolean) => void) => {
            eventEmitter.on('pausedChanged', handler);
            handler(pausedState);
            return () => {
                eventEmitter.removeListener('pausedChanged', handler);
            };
        },
        onShellLoggingEvent: (handler: (state: string) => void) => {
            eventEmitter.on('shellLogging', handler);
            return () => {
                eventEmitter.removeListener('shellLogging', handler);
            };
        },
        onUnknownCommand: (handler: (state: string) => void) => {
            eventEmitter.on('unknownCommand', handler);
            return () => {
                eventEmitter.removeListener('unknownCommand', handler);
            };
        },
        enqueueRequest: async (
            command: string,
            onSuccess: (response: string, command: string) => void = () => {},
            onError: (message: string, command: string) => void = () => {},
            onTimeout: (message: string, command: string) => void = () => {},
            unique = false
        ) => {
            if (unique) {
                const existingCommand = commandQueue.find(
                    item => item.command === command
                );
                if (existingCommand) {
                    existingCommand.callbacks.push({
                        onSuccess,
                        onError,
                        onTimeout,
                    });
                    // init sending of commands
                    await initDataSend();
                    return;
                }
            }

            commandQueue.push({
                command,
                callbacks: [
                    {
                        onSuccess,
                        onError,
                        onTimeout,
                    },
                ],
                sent: false,
                sentTime: -1,
            });

            // init sending of commands
            await initDataSend();
        },
        registerCommandCallback: (
            command: string,
            onSuccess: (data: string, command: string) => void,
            onError: (error: string, command: string) => void
        ) => {
            // Add Callbacks to the queue for future responses
            const callbacks = { onSuccess, onError };
            const existingCallbacks = commandQueueCallbacks.get(command);
            if (typeof existingCallbacks !== 'undefined') {
                commandQueueCallbacks.set(command, [
                    ...existingCallbacks,
                    callbacks,
                ]);
            } else {
                commandQueueCallbacks.set(command, [{ onSuccess, onError }]);
            }

            return () => {
                const cb = commandQueueCallbacks.get(command);

                if (cb === undefined) return;

                if (cb.length === 1) {
                    commandQueueCallbacks.delete(command);
                    return;
                }

                cb.splice(cb.indexOf(callbacks), 1);
                commandQueueCallbacks.set(command, cb);
            };
        },
        unregister: () => {
            unregisterOnResponse();
            unregisterOnDataWritten();
            unregisterOnClosed();
            reset();
        },
        isPaused: () => pausedState,
        unPause: () => serialPort.write(String.fromCharCode(21)),
        setShellEchos: (value: boolean) => {
            shellEchos = value;
            if (shellEchos) bufferedDataWrittenData = '';
        },
    };
};
