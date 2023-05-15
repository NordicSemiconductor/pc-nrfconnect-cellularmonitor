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
    selectedDevice,
} from 'pc-nrfconnect-shared';

import { connectToSerialPort } from '../features/terminal/uartSerialPort';
import { stopTrace } from '../features/tracing/nrfml';
import { resetTraceEvents } from '../features/tracing/tracePacketEvents';
import {
    removeShellParser,
    resetManualDbFilePath,
    resetTraceInfo,
    setAvailableSerialPorts,
    setDetectingTraceDb,
    setSerialPort,
    setUartSerialPort,
} from '../features/tracing/traceSlice';
import { clearATQueue } from '../features/tracingEvents/at/sendCommand';
import { resetDashboardState } from '../features/tracingEvents/dashboardSlice';
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
        clearATQueue();
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
    dispatch(resetManualDbFilePath());
};

const openDevice =
    (device: Device): TAction =>
    dispatch => {
        dispatch(resetDashboardState());
        dispatch(resetTraceInfo());
        resetTraceEvents();
        // Reset serial port settings
        dispatch(setAvailableSerialPorts([]));
        dispatch(setSerialPort(null));
        const ports = device.serialPorts;

        if (ports && ports.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }

        dispatch(autoSetTraceSerialPort(device, ports));
        dispatch(autoSetUartSerialPort(ports));
    };

const autoSetTraceSerialPort =
    (device: Device, ports: SerialPort[] | undefined): TAction =>
    dispatch => {
        const persistedPath = getPersistedSerialPort(device.serialNumber);
        if (persistedPath) {
            dispatch(setSerialPort(persistedPath));
            return;
        }
        const port = autoSelectTraceSerialPort(ports ?? []);
        const path = port?.comName ?? device?.serialport?.comName;
        if (path) {
            dispatch(setSerialPort(path));
        } else {
            logger.error("Couldn't identify trace serial port");
        }
    };

const autoSetUartSerialPort =
    (ports: SerialPort[] | undefined): TAction =>
    async dispatch => {
        const port = autoSelectUartSerialPort(ports ?? []);
        if (port && port.path) {
            const uartSerialPort = await connectToSerialPort(
                dispatch,
                port.path
            );

            if (uartSerialPort) {
                dispatch(setUartSerialPort(uartSerialPort));
            }
        } else {
            logger.error('Could not identify serial port');
        }
    };

/**
 * Pick the serialport that should belong to the modem on PCA10090.
 * nrf-device-lib-js should ensure that the order of serialport objects is
 * deterministic and that the last port in the array is the one used for modem trace.
 * @param {Array<device>} ports array of nrf-device-lib-js serialport objects
 * @returns {SerialPort} the selected serialport object
 */
const autoSelectTraceSerialPort = (ports: SerialPort[]) => ports?.at(-1);
const autoSelectUartSerialPort = (ports: SerialPort[]) => ports?.at(0);
