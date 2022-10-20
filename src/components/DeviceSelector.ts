/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    DeviceTraits,
    SerialPort,
} from '@nordicsemiconductor/nrf-device-lib-js';
import {
    Device,
    DeviceSelector,
    DeviceSelectorProps,
    logger,
} from 'pc-nrfconnect-shared';
import { connect } from 'react-redux';

import { stopTrace } from '../features/tracing/nrfml';
import {
    getTaskId,
    setAvailableSerialPorts,
    setDetectingTraceDb,
    setSerialPort,
} from '../features/tracing/traceSlice';
import type { TAction } from '../thunk';
import { TDispatch } from '../thunk';
import { getSerialPort as getPersistedSerialPort } from '../utils/store';

const deviceListing: DeviceTraits = {
    nordicUsb: true,
    serialPorts: true,
    jlink: true,
};

const mapState = (): DeviceSelectorProps => ({
    deviceListing,
});

const mapDispatch = (dispatch: TDispatch): Partial<DeviceSelectorProps> => ({
    onDeviceSelected: (device: Device) => {
        logger.info(`Selected device with s/n ${device.serialNumber}`);
        dispatch(openDevice(device));
    },
    onDeviceDeselected: () => {
        logger.info('Deselected device');
        dispatch(closeDevice());
    },
});

export default connect(mapState, mapDispatch)(DeviceSelector);

const closeDevice = (): TAction => (dispatch, getState) => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSerialPort(null));
    const taskId = getTaskId(getState());
    dispatch(stopTrace(taskId));
    dispatch(setDetectingTraceDb(false));
};

const openDevice =
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
