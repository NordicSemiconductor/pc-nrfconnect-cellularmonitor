/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from 'pc-nrfconnect-shared';
import { TDispatch } from 'pc-nrfconnect-shared/src/state';

import { RootState } from '../../../appReducer';
import { sendMacros } from '../../../components/SidePanel/Macros';
import { getUartSerialPort } from '../../tracing/traceSlice';
import { documentationMap } from './index';

type recommendedAT = Partial<
    Record<keyof typeof documentationMap, string | string[]>
>;

// Maps a given AT command to a runable AT command string
// which will be used to easily run the command and populate the given field
// in the dashboard.
export const recommendedAT: recommendedAT = {
    'AT+CEREG': 'AT+CEREG?',
    'AT+COPS': ['AT+COPS?', 'AT+COPS=?'],
    // TODO: write processor for XCONNSTAT
    // 'AT+XCONNSTAT': 'AT+XCONNSTAT?',
    'AT%CESQ': 'AT%CESQ?',
    'AT+CSCON': 'AT+CSCON?',
    'AT+CPAS': 'AT+CPAS',
    'AT+CEDRXRDP': 'AT+CEDRXRDP',
    'AT%XTIME': 'AT%XTIME=1',
    'AT%CONEVAL': 'AT%CONEVAL',
    'AT%XCBAND': 'AT%XCBAND',
    'AT%HWVERSION': 'AT%HWVERSION',
};

export const sendRecommendedCommand =
    (atCommand: keyof recommendedAT) =>
    async (_dispatch: TDispatch, getState: () => RootState) => {
        const uartSerialPort = getUartSerialPort(getState());

        if (uartSerialPort && (await uartSerialPort.isOpen())) {
            if (typeof recommendedAT[atCommand] === 'string') {
                uartSerialPort.write(`${recommendedAT[atCommand]}\r`);
                logger.info(`Sent AT command: ${atCommand}`);
            } else {
                sendMacros(
                    uartSerialPort,
                    recommendedAT[atCommand] as string[],
                        true
                    );
                }
            }
        };
