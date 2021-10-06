/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { SerialPort } from '@nordicsemiconductor/nrf-device-lib-js';
import { Device, logger } from 'pc-nrfconnect-shared';

import { stopTrace } from '../features/tracing/nrfml';
import {
    getTaskId,
    setAvailableSerialPorts,
    setSerialPort,
} from '../features/tracing/traceSlice';
import { TAction } from '../thunk';
import { getSerialPort as getPersistedSerialPort } from '../utils/store';

export const closeDevice = (): TAction => (dispatch, getState) => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSerialPort(null));
    const taskId = getTaskId(getState());
    dispatch(stopTrace(taskId));
};

export const openDevice =
    (device: Device): TAction =>
    dispatch => {
        // Reset serial port settings
        dispatch(setAvailableSerialPorts([]));
        dispatch(setSerialPort(null));
        const ports = device.serialPorts;
        if (ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }
        const persistedPath = getPersistedSerialPort(device.serialNumber);
        if (persistedPath) {
            dispatch(setSerialPort(persistedPath));
            return;
        }
        const port = autoSelectPort(ports);
        const path = port?.comName ?? device?.serialport?.comName;
        if (path) {
            dispatch(setSerialPort(path));
        } else {
            logger.error("Couldn't identify serial port");
        }
    };

/**
 * Pick the serialport that should belong to the modem on PCA10090.
 * nrf-device-lib-js should ensure that the order of serialport objects is
 * deterministic and that the last port in the array is the one used for modem trace.
 * @param {Array<device>} ports array of nrf-device-lib-js serialport objects
 * @returns {SerialPort} the selected serialport object
 */
const autoSelectPort = (ports: SerialPort[]) => ports?.slice(-1)[0];
