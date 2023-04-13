import { logger } from 'pc-nrfconnect-shared';
import { TDispatch } from 'pc-nrfconnect-shared/src/state';

import { RootState } from '../../../appReducer';
import { getUartSerialPort } from '../../tracing/traceSlice';
import { documentationMap } from './index';

type recommendedAT = Partial<Record<keyof typeof documentationMap, string>>;

// Maps a given AT command to a runable AT command string
// which will be used to easily run the command and populate the given field
// in the dashboard.
export const recommendedAT: recommendedAT = {
    'AT+CEREG': 'AT+CEREG?',
};

export const sendRecommendedCommand =
    (atCommand: keyof recommendedAT) =>
    async (_dispatch: TDispatch, getState: () => RootState) => {
        const uartSerialPort = getUartSerialPort(getState());

        if (uartSerialPort && (await uartSerialPort.isOpen())) {
            uartSerialPort.write(`${recommendedAT[atCommand]}\r`);
            logger.info(`Sent AT command: ${atCommand}`);
        }
    };
