/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
/* eslint-disable no-await-in-loop */

import { firmwareProgram } from '@nordicsemiconductor/nrf-device-lib-js';
import { readFileSync } from 'fs';
import { Device, getDeviceLibContext, logger } from 'pc-nrfconnect-shared';

import { downloadedFilePath, Firmware, Sample } from './samples';

export type SampleProgress = {
    fw: Firmware;
    progressJson: Parameters<
        Parameters<typeof firmwareProgram>['6']
    >['0']['progressJson'];
};

export const isThingy91 = (device?: Device) =>
    device?.serialport?.productId === '9100';

export const is91DK = (device?: Device) =>
    device?.jlink?.boardVersion === 'PCA10090';

export const flash = async (
    device: Device,
    sample: Sample,
    progress: (progress: SampleProgress) => void
) => {
    try {
        // eslint-disable-next-line no-restricted-syntax
        for (const fw of sample.fw) {
            switch (fw.type) {
                case 'Modem':
                    await programModem(device, fw, progress);

                    break;
                case 'Application':
                    await programFirmware(device, fw, progress);
                    break;
                default:
                    throw new Error(`Unable to program fw type: ${fw.type}`);
            }
        }
    } catch (error) {
        logger.error(error);
    }
};

const programModem = (
    device: Device,
    fw: Firmware,
    progress: (progress: SampleProgress) => void
) =>
    new Promise<void>((resolve, reject) => {
        firmwareProgram(
            getDeviceLibContext(),
            device.id,
            'NRFDL_FW_FILE',
            'NRFDL_FW_NRF91_MODEM',
            downloadedFilePath(fw.file),
            error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            },
            ({ progressJson }) => {
                progress({ fw, progressJson });
            }
        );
    });

const programFirmware = (
    device: Device,
    fw: Firmware,
    progress: (progress: SampleProgress) => void
) =>
    new Promise<void>((resolve, reject) => {
        firmwareProgram(
            getDeviceLibContext(),
            device.id,
            'NRFDL_FW_BUFFER',
            'NRFDL_FW_INTEL_HEX',
            readFileSync(downloadedFilePath(fw.file)),
            error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            },
            ({ progressJson }) => {
                progress({ fw, progressJson });
            },
            null,
            'NRFDL_DEVICE_CORE_APPLICATION'
        );
    });
