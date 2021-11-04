/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device } from 'pc-nrfconnect-shared';

import { RootState } from '../reducers';

// DeviceInfo will be exported since shared v4.28.3
export { deviceInfo } from 'pc-nrfconnect-shared/src/Device/deviceInfo/deviceInfo';

// selectedDevice is found in pc-nrfconnect-shared/src/Device/deviceReducer but not exported by shared yet
export const selectedDevice = (state: RootState) =>
    (
        state.device.devices as unknown as {
            [key: string]: Device | undefined;
        }
    )[state.device.selectedSerialNumber ?? ''];
