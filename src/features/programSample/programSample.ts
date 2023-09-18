/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
/* eslint-disable no-await-in-loop */

import {
    Device,
    logger,
    usageData,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    NrfutilDeviceLib,
    type Progress,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';

import EventAction from '../../usageDataActions';
import { downloadedFilePath, Firmware, ModemFirmware } from './samples';

const { reset, program } = NrfutilDeviceLib;

export type SampleProgress = {
    fw: Firmware | ModemFirmware;
    progressJson: Progress;
};

export type SupportedDeviceVersion = 'nRF9160' | 'nRF9161';

export const getNrfDeviceVersion = (
    device?: Device
): SupportedDeviceVersion => {
    let deviceVersion: 'nRF9160' | 'nRF9161' | undefined;
    if (is9161DK(device)) {
        deviceVersion = 'nRF9161';
    } else if (is9160DK(device) || isThingy91(device)) {
        deviceVersion = 'nRF9160';
    }
    if (deviceVersion) {
        return deviceVersion;
    }

    logger.error(
        'Attempted to retrieve trace databases for an unrecognized device',
        device
    );
    return undefined as never;
};

export const isThingy91 = (device?: Device) =>
    device?.serialport?.productId === '9100';

export const is9160DK = (device?: Device) =>
    device?.jlink?.boardVersion === 'PCA10090';

export const is9161DK = (device?: Device) =>
    device?.jlink?.boardVersion === 'PCA10153';

export const programModemFirmware = async (
    device: Device,
    modemFirmware: ModemFirmware,
    progress: (progress: SampleProgress) => void
) => {
    try {
        usageData.sendUsageData(EventAction.PROGRAM_SAMPLE, modemFirmware.file);
        await programModem(device, modemFirmware, progress);
    } catch (error) {
        usageData.sendErrorReport(
            `Failed to program modem firmware: ${modemFirmware.file}`
        );
        logger.error(error);
        throw error;
    }
};

export const programDevice = async (
    device: Device,
    firmwares: Firmware[],
    progress: (progress: SampleProgress) => void
) => {
    try {
        // eslint-disable-next-line no-restricted-syntax
        for (const fw of firmwares) {
            usageData.sendUsageData(EventAction.PROGRAM_SAMPLE, fw.file);
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

        logger.info('Programming complete, reseting device.');
        reset(device);
    } catch (error) {
        usageData.sendErrorReport('Failed to program a sample');
        logger.error(error);
        throw error;
    }
};

const programModem = (
    device: Device,
    fw: Firmware | ModemFirmware,
    progressCb: (progress: SampleProgress) => void
) =>
    program(device, downloadedFilePath(fw.file), progress => {
        progressCb({ fw, progressJson: progress });
    });

const programFirmware = (
    device: Device,
    fw: Firmware,
    progress: (progress: SampleProgress) => void
) =>
    program(
        device,
        downloadedFilePath(fw.file),
        progressJson => {
            progress({ fw, progressJson });
        },
        'Application'
    );
