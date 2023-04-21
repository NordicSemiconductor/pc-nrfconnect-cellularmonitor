/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
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

import { stopTrace } from '../features/tracing/nrfml';
import {
    removeShellParser,
    setAvailableSerialPorts,
    setDetectingTraceDb,
    setSerialPort,
    setUartSerialPort,
} from '../features/tracing/traceSlice';
import { getSerialPort as getPersistedSerialPort } from '../utils/store';
import type { TAction } from '../utils/thunk';
import { TDispatch } from '../utils/thunk';

const deviceListing: DeviceTraits = {
    nordicUsb: true,
    serialPorts: true,
    jlink: true,
    mcuBoot: true,
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

const closeDevice = (): TAction => dispatch => {
    logger.info('Closing device');
    dispatch(setUartSerialPort(null));
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSerialPort(null));
    dispatch(stopTrace());
    dispatch(setDetectingTraceDb(false));
    dispatch(removeShellParser());
};

const openDevice =
    (device: Device): TAction =>
    dispatch => {
        // Reset serial port settings
        dispatch(setAvailableSerialPorts([]));
        dispatch(setSerialPort(null));
        const ports = device.serialPorts;

        if (ports && ports.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }
        const persistedPath = getPersistedSerialPort(device.serialNumber);
        if (persistedPath) {
            dispatch(setSerialPort(persistedPath));
            return;
        }
        const port = autoSelectPort(ports ?? []);
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
