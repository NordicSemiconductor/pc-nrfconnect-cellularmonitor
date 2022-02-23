/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';
import {
    Device,
    DeviceSelector,
    DeviceSelectorProps,
    logger,
} from 'pc-nrfconnect-shared';

import { closeDevice, openDevice } from '../actions/deviceActions';
import { TDispatch } from '../thunk';

// @ts-expect-error -- remove when traits are set as optional in nrf-device-lib-js
const deviceListing: DeviceTraits = {
    nordicUsb: true,
    seggerUsb: true,
    jlink: true,
    modem: true,
};

const mapState = () => ({
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
