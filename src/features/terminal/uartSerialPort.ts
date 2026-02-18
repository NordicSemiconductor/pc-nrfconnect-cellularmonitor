/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    AppThunk,
    createSerialPort,
    Device,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import type { Dispatch } from 'redux';
import { Terminal } from 'xterm-headless';

import { RootState } from '../../app/appReducer';
import { raceTimeout } from '../../common/promise';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../shell/shellParser';
import {
    setDetectedAtHostLibrary,
    setShowConflictingSettingsDialog,
} from '../tracing/traceSlice';
import { detectLineEnding } from '../tracingEvents/at/detectLineEnding';
import { testIfShellMode } from '../tracingEvents/at/sendCommand';
import {
    removeShellParser,
    setShellParser,
    setTerminalSerialPort,
} from './serialPortSlice';

const LOGGER_PREFIX = 'Terminal Serial Port:';

export const connectToSerialPort = async (
    dispatch: Dispatch,
    path: string,
    overwrite = false,
) => {
    let createdSerialPort;
    try {
        createdSerialPort = await createSerialPort(
            {
                path,
                baudRate: 115200,
            },
            { overwrite, settingsLocked: false },
        );
    } catch (error) {
        const msg = (error as Error).message;
        if (msg.includes('FAILED_DIFFERENT_SETTINGS')) {
            dispatch(setShowConflictingSettingsDialog(true));
        } else {
            logger.error(
                `${LOGGER_PREFIX} Port could not be opened. Verify it is not used by some other applications`,
            );
        }
    }

    if (!createdSerialPort) return;

    dispatch(setTerminalSerialPort(createdSerialPort));

    /*
         Some applications that run Line Mode have an issue, where if you power-cycle the device,
         the first AT command after the power-cycle will return an ERROR. This function `testIfShellMode`
         makes us avoid this issue, because we emit a command that will return OK if it's in shell mode, and
         ERROR if it's in line mode. Since we already got the ERROR, we won't unexpectedly get it again
         the next time we send a command.
         */
    const isShellMode = await raceTimeout(testIfShellMode(createdSerialPort));
    // If race times out, then we assume AT Host is not detected on device.
    const detectedAtHostLibrary = isShellMode !== undefined;

    if (!isShellMode) {
        await detectLineEnding(createdSerialPort);
    }

    if (detectedAtHostLibrary) {
        dispatch(setDetectedAtHostLibrary(true));

        if (isShellMode) {
            logger.debug(
                `${LOGGER_PREFIX} Detected AT Host Library: Device is in shell mode`,
            );
            dispatch(
                setShellParser(
                    await hookModemToShellParser(
                        createdSerialPort,
                        xTerminalShellParserWrapper(
                            new Terminal({ allowProposedApi: true, cols: 999 }),
                        ),
                    ),
                ),
            );
        } else {
            logger.debug(
                `${LOGGER_PREFIX} Detected AT Host Library: Device is in Line mode`,
            );
            dispatch(removeShellParser());
        }
    } else {
        logger.debug(`${LOGGER_PREFIX} Could not detect AT Host library`);
        dispatch(setDetectedAtHostLibrary(false));
        dispatch(removeShellParser());
    }
};

export const autoSetUartSerialPort =
    (device: Device): AppThunk<RootState> =>
    dispatch => {
        if (!device.serialPorts || device.serialPorts.length < 2) {
            logger.debug(
                `${LOGGER_PREFIX} Fewer than two serial ports exposed, and will therefore not auto-connect.`,
            );
            return;
        }
        const serialPortPath = device.serialPorts?.at(0)?.comName;
        if (serialPortPath) {
            connectToSerialPort(dispatch, serialPortPath);
            logger.debug(
                `${LOGGER_PREFIX} Will attempt to auto-connect to serial port ${serialPortPath}`,
            );
        } else {
            logger.error(
                `${LOGGER_PREFIX} Serial port found, but could not identify serial port path`,
            );
        }
    };
