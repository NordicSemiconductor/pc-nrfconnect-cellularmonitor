/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSerialPort, logger } from 'pc-nrfconnect-shared';
import type { Dispatch } from 'redux';
import { Terminal } from 'xterm-headless';

import { raceTimeout } from '../../utils/promise';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../shell/shellParser';
import {
    removeShellParser,
    setDetectedAtHostLibrary,
    setShellParser,
    setShowConflictingSettingsDialog,
} from '../tracing/traceSlice';
import { testIfShellMode } from '../tracingEvents/at/sendCommand';

export const connectToSerialPort = async (
    dispatch: Dispatch,
    path: string,
    overwrite = false
) => {
    let port;
    try {
        port = await createSerialPort(
            {
                path,
                baudRate: 115200,
            },
            { overwrite, settingsLocked: false }
        );
    } catch (error) {
        const msg = (error as Error).message;
        if (msg.includes('FAILED_DIFFERENT_SETTINGS')) {
            dispatch(setShowConflictingSettingsDialog(true));
        } else {
            logger.error(
                'Port could not be opened. Verify it is not used by some other applications'
            );
        }
    }

    if (!port) return;

    /*
         Some applications that run Line Mode have an issue, where if you power-cycle the device,
         the first AT command after the power-cycle will return an ERROR. This function `testIfShellMode`
         makes us avoid this issue, because we emit a command that will return OK if it's in shell mode, and
         ERROR if it's in line mode. Since we already got the ERROR, we won't unexpectedly get it again
         the next time we send a command.
         */
    const isShellMode = await raceTimeout(testIfShellMode(port));

    if (isShellMode === undefined) {
        dispatch(setDetectedAtHostLibrary(false));
    } else {
        dispatch(setDetectedAtHostLibrary(true));
        if (isShellMode) {
            const shellParser = await hookModemToShellParser(
                port,
                xTerminalShellParserWrapper(
                    new Terminal({ allowProposedApi: true, cols: 999 })
                ),
                {
                    shellPromptUart: 'mosh:~$',
                    logRegex:
                        /[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): /,
                    errorRegex: /ERROR/i,
                    timeout: 10_000,
                }
            );
            dispatch(setShellParser(shellParser));
        } else {
            dispatch(removeShellParser());
        }
    }

    return port;
};
