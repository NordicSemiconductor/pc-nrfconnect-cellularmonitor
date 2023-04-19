/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger, SerialPort } from 'pc-nrfconnect-shared';
import { TDispatch } from 'pc-nrfconnect-shared/src/state';

import { RootState } from '../../../appReducer';
import { getUartSerialPort } from '../../tracing/traceSlice';
import { documentationMap } from './index';

type recommendedAT = Partial<
    Record<keyof typeof documentationMap, string | string[]>
>;

// Maps a given AT command to a runable AT command string
// which will be used to easily run the command and populate the given field
// in the dashboard.
export const recommendedAT: recommendedAT = {
    'AT+CGMI': 'AT+CGMI',
    'AT+CGMR': 'AT+CGMR',
    'AT+CGSN': 'AT+CGSN',
    'AT%XMODEMUUID': 'AT%XMODEMUUID',
    'AT%XDATAPRFL': 'AT%XDATAPRFL?',
    'AT+CEREG': 'AT+CEREG?',
    'AT+CFUN': 'AT+CFUN?',
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
    'AT%XMODEMTRACE': 'AT%XMODEMTRACE=1,2',
    'AT%XSYSTEMMODE': 'AT%XSYSTEMMODE?',

    'AT%XEMPR': 'AT%XEMPR?',
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

export const recommendedAt = [
    'AT+CFUN=1',
    'AT+CGSN=1',
    'AT+CGMI',
    'AT+CGMM',
    'AT+CGMR',
    'AT+CEMODE?',
    'AT%XCBAND=?',
    'AT+CMEE?',
    'AT+CNEC?',
    'AT+CGEREP?',
    'AT+CIND=1,1,1',
    'AT+CEREG=5',
    'AT+CEREG?',
    'AT+COPS=3,2',
    'AT+COPS?',
    'AT%XCBAND',
    'AT+CGDCONT?',
    'AT+CGACT?',
    'AT%CESQ=1',
    'AT+CESQ',
    'AT%XSIM=1',
    'AT%XSIM?',
    'AT+CPIN?',
    'AT+CPINR="SIM PIN"',
    'AT+CIMI',
    'AT+CNEC=24',
    'AT+CMEE=1',
    'AT+CEER',
    'AT%MDMEV=1',
    'AT%CESQ=1',
    'AT+CGEREP=1',
    'AT%XTIME=1',
    'AT+CSCON=1',
    'AT%XPOFWARN=1,30',
    'AT%XVBATLVL=1',
    'AT%XMONITOR',
    'AT%CONEVAL',
    'AT%XCONNSTAT=1',
    'AT#XPING="www.google.com",45,5000,5,1000',
    'AT%XCONNSTAT?',
    'AT%HWVERSION',
    'AT%XMODEMUUID',
    'AT%XDATAPRFL?',
    'AT%XSYSTEMMODE?',
];

// Todo: need to set mode in store, in order to not always check for mode
export const sendMacros = (
    serialPort: SerialPort,
    commands: string[],
    mode?: boolean
) => {
    if (mode) {
        subscribe(serialPort, '', commands);
    } else {
        testMode(serialPort, commands);
    }
};

const testMode = (serialPort: SerialPort, commands: string[]) => {
    const decoder = new TextDecoder();
    let prefix = 'at ';
    let response = '';

    const testHandler = serialPort.onData(data => {
        response += decoder.decode(data);
        const doCompare = response.endsWith('\r\n');
        if (doCompare) {
            if (response.includes('ERROR')) {
                prefix = '';
            }

            testHandler();
            subscribe(serialPort, prefix, commands);
        }
    });

    serialPort.write(`${prefix} AT\r\n`);
};

const subscribe = (
    serialPort: SerialPort,
    prefix: string,
    commands: string[]
) => {
    const decoder = new TextDecoder();
    let commandIndex = 0;
    let response = '';

    const handler = serialPort.onData(data => {
        response += decoder.decode(data);
        const doCompare = response.endsWith('\r\n');
        const doContinue =
            (doCompare && response.includes('OK')) ||
            response.includes('ERROR');
        if (doContinue) {
            commandIndex += 1;

            if (commandIndex < commands.length) {
                serialPort.write(`${prefix}${commands[commandIndex]}\r\n`);
            } else {
                // Cleanup when all commands have been sent.
                handler();
            }
            response = '';
        }
    });

    serialPort.write(`${prefix}${commands[commandIndex]}\r\n`);
};

const analysisSetup = [
    // General Initial Setup
    'AT+CFUN=4',
    'AT+CPSMS=',
    'AT+CGMR',
    'AT+CNEC=24',
    'AT+CGEREP=1',
    'AT%MDMEV=1',
    'AT+CEREG=5',
    'AT%XSIM=1',
    'AT+CSCON=1',
    'AT%REL14FEAT=0,1,0,0,0',
];

const simCardSetup = [
    // SimCard Setup
    'AT+CFUN=41',
    'AT+CNUM',
    'AT+CIMI',
    'AT%XICCID',
    'AT+CPIN?',
];

const startupModem = [
    // Modem Running
    'AT%XSYSTEMMODE=1,0,0,0',
    'AT+CFUN=1',
    'AT+%CONEVAL',
    'AT%XMONITOR',
    'AT+CGDCONT?',
    'AT%NBRGRSRP',
];

const checkAsRai = [
    // Check AS-RAI
    'AT%RAI=1',
];

const checkPSM = [
    // Check PSM (T3412) and Active timer (T3324) values
    // PSM and eDRX
    'AT+CPSMS=1,"","","11000001","01011111"',
    'AT+CEDRXS=2,4, "0000","0000"',
];

const getAvailableOperators = [
    // Get available operators
    'AT%COPS=?',
];

const setupNbIot = [
    // Setup NB-IOT
    'AT+CFUN=4',
    'AT%RAI=0',
    'AT%XSYSTEMMODE=0,1,0,0',
    'AT+CFUN=1',
    'AT+%CONEVAL',
    'AT%XMONITOR',
    'AT+CGDCONT?',
    'AT%NBRGRSRP',
];

export const ltemReport = [
    ...analysisSetup,
    ...simCardSetup,
    ...startupModem,
    ...checkAsRai,
    ...checkPSM,
    ...getAvailableOperators,
];

export const nbIotReport = [
    ...setupNbIot,
    ...checkAsRai,
    ...checkPSM,
    ...getAvailableOperators,
];

export const fullReport = [...ltemReport, ...nbIotReport];
