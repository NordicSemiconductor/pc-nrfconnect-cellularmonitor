/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import {
    AppDispatch,
    AppThunk,
    Device,
    DeviceSelector,
    DeviceSelectorProps,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import type {
    DeviceSerialPort,
    DeviceTraits,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';

import { is9161DK } from '../features/programSample/programSample';
import {
    removeShellParser,
    setTerminalSerialPort as setUartSerialPort,
} from '../features/terminal/serialPortSlice';
import { autoSetUartSerialPort } from '../features/terminal/uartSerialPort';
import { stopTrace } from '../features/tracing/nrfml';
import { resetTraceEvents } from '../features/tracing/tracePacketEvents';
import {
    resetManualDbFilePath,
    resetTraceInfo,
    setAvailableSerialPorts,
    setDetectingTraceDb,
    setTraceSerialPort,
} from '../features/tracing/traceSlice';
import { clearATQueue } from '../features/tracingEvents/at/sendCommand';
import { resetDashboardState } from '../features/tracingEvents/dashboardSlice';
import { RootState } from './appReducer';
import { getSerialPort as getPersistedSerialPort } from './store';

const deviceListing: DeviceTraits = {
    nordicUsb: true,
    serialPorts: true,
    jlink: true,
    mcuBoot: true,
};

const mapState = (): DeviceSelectorProps => ({
    deviceListing,
});

const mapDispatch = (dispatch: AppDispatch): Partial<DeviceSelectorProps> => ({
    onDeviceSelected: (device: Device) => {
        dispatch(openDevice(device));
    },
    onDeviceDeselected: () => {
        dispatch(closeDevice());
        clearATQueue();
    },
});

export default connect(mapState, mapDispatch)(DeviceSelector);

const closeDevice = (): AppThunk<RootState> => dispatch => {
    dispatch(setUartSerialPort(null));
    dispatch(setAvailableSerialPorts([]));
    dispatch(setTraceSerialPort(null));
    dispatch(stopTrace());
    dispatch(setDetectingTraceDb(false));
    dispatch(removeShellParser());
    dispatch(resetManualDbFilePath());
};

const openDevice =
    (device: Device): AppThunk<RootState> =>
    dispatch => {
        dispatch(resetDashboardState());
        dispatch(resetTraceInfo());
        resetTraceEvents();
        // Reset serial port settings
        dispatch(setAvailableSerialPorts([]));
        dispatch(setTraceSerialPort(null));

        dispatch(
            setAvailableSerialPorts(
                device.serialPorts?.map(port => port.comName ?? '') ?? []
            )
        );

        dispatch(autoSetTraceSerialPort(device));
        dispatch(autoSetUartSerialPort(device));

        if (is9161DK(device)) {
            logger.warn(
                'Modem tracing can become unresponsive when resetting the device multiple times. An automatic firmware update to resolve the issue is being worked on.'
            );
        }
    };

const autoSetTraceSerialPort =
    (device: Device): AppThunk<RootState> =>
    dispatch => {
        if (device.serialPorts == null) {
            return;
        }

        const persistedPath =
            device.serialNumber != null
                ? getPersistedSerialPort(device.serialNumber)
                : null;

        if (persistedPath) {
            // Verify that the port is available on the selected device.
            if (
                device.serialPorts.findIndex(
                    port => port.comName === persistedPath
                ) !== -1
            ) {
                dispatch(setTraceSerialPort(persistedPath));
                return;
            }
        }

        const port = autoSelectTraceSerialPort(device?.serialPorts ?? []);
        const path = port?.comName ?? port?.path;
        if (path) {
            dispatch(setTraceSerialPort(path));
        } else {
            logger.error("Couldn't identify trace serial port");
        }
    };

/**
 * Pick the serialport that should belong to the modem on PCA10090.
 * nrf-device-lib-js should ensure that the order of serialport objects is
 * deterministic and that the last port in the array is the one used for modem trace.
 * @param {Array<device>} ports array of nrf-device-lib-js serialport objects
 * @returns {SerialPort} the selected serialport object
 */
const autoSelectTraceSerialPort = (ports: DeviceSerialPort[]) => ports?.at(-1);
