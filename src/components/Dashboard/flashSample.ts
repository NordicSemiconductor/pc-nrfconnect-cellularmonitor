/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { firmwareProgram } from '@nordicsemiconductor/nrf-device-lib-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Device, getAppDir, getDeviceLibContext } from 'pc-nrfconnect-shared';

export const isThingy91 = (device: Device) =>
    device?.serialport?.productId === '9100';

export const is91DK = (device: Device) =>
    device?.jlink?.boardVersion === 'PCA10090';

export const flash = async (
    device: Device,
    progress: (progress?: string) => void
) => {
    progress('Programming modem...');
    await programModem(device, progress);
    progress('Programming firmware...');
    await programFirmware(device, progress);
    progress('Completed programming sample');
};

const programModem = (device: Device, progress: (progress?: string) => void) =>
    new Promise<void>((resolve, reject) => {
        const modemFile = join(
            getAppDir(),
            'resources',
            'firmware',
            'mfw_nrf9160_1.3.3.zip'
        );

        firmwareProgram(
            getDeviceLibContext(),
            device.id,
            'NRFDL_FW_FILE',
            'NRFDL_FW_NRF91_MODEM',
            modemFile,
            complete => {
                console.log('complete', complete);

                if (complete) {
                    reject(complete);
                } else {
                    resolve();
                }
            },
            ({ progressJson }) => {
                console.log(progressJson);

                progress(progressJson.message);
            }
        );
    });

const programFirmware = (
    device: Device,
    progress: (progress?: string) => void
) =>
    new Promise<void>((resolve, reject) => {
        const hexFile = isThingy91(device)
            ? 'thingy91_asset_tracker_v2_debug_2022-12-08_188a1603.hex'
            : 'nrf9160dk_asset_tracker_v2_debug_2022-09-15_7a358cb7.hex';

        const firmwareFile = join(
            getAppDir(),
            'resources',
            'firmware',
            hexFile
        );

        const buffer = readFileSync(firmwareFile);

        firmwareProgram(
            getDeviceLibContext(),
            device.id,
            'NRFDL_FW_BUFFER',
            'NRFDL_FW_INTEL_HEX',
            buffer,
            complete => {
                if (complete) {
                    reject(complete);
                } else {
                    resolve();
                }
            },
            ({ progressJson }) => {
                console.log(progressJson);

                progress(progressJson.message);
            },
            null,
            'NRFDL_DEVICE_CORE_APPLICATION'
        );
    });
