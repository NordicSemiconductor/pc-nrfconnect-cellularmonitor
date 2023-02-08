/* eslint-disable no-await-in-loop */
/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { firmwareProgram } from '@nordicsemiconductor/nrf-device-lib-js';
import { readFileSync } from 'fs';
import { Device, getDeviceLibContext } from 'pc-nrfconnect-shared';

import { Sample } from './samples';

export const isThingy91 = (device?: Device) =>
    device?.serialport?.productId === '9100';

export const is91DK = (device?: Device) =>
    device?.jlink?.boardVersion === 'PCA10090';

export const flash = async (
    device: Device,
    sample: Sample,
    progress: (progress?: string) => void
) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const fw of sample.fw) {
        switch (fw.type) {
            case 'Modem':
                await programModem(device, fw.file, progress);

                break;
            case 'Application':
                await programFirmware(device, fw.file, progress);
                break;
            default:
                throw new Error(`Unable to program fw type: ${fw.type}`);
        }
    }

    progress('Programming complete');
};

const programModem = (
    device: Device,
    file: string,
    progress: (progress?: string) => void
) =>
    new Promise<void>((resolve, reject) => {
        firmwareProgram(
            getDeviceLibContext(),
            device.id,
            'NRFDL_FW_FILE',
            'NRFDL_FW_NRF91_MODEM',
            file,
            complete => {
                if (complete) {
                    progress(`Programming ${file} failed`);
                    reject(complete);
                } else {
                    progress(`Programming ${file} succeeded`);
                    resolve();
                }
            },
            ({ progressJson }) => {
                progress(progressJson.message);
            }
        );
    });

const programFirmware = (
    device: Device,
    file: string,
    progress: (progress?: string) => void
) =>
    new Promise<void>((resolve, reject) => {
        const buffer = readFileSync(file);

        firmwareProgram(
            getDeviceLibContext(),
            device.id,
            'NRFDL_FW_BUFFER',
            'NRFDL_FW_INTEL_HEX',
            buffer,
            complete => {
                if (complete) {
                    progress(`Programming ${file} failed`);
                    reject(complete);
                } else {
                    progress(`Programming ${file} succeeded`);
                    resolve();
                }
            },
            ({ progressJson }) => {
                progress(progressJson.message);
            },
            null,
            'NRFDL_DEVICE_CORE_APPLICATION'
        );
    });
