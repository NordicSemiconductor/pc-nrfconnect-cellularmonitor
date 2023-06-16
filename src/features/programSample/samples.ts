/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync } from 'fs';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { getAppDataDir, getAppDir, logger } from 'pc-nrfconnect-shared';

export interface Firmware {
    file: string;
    type: 'Application' | 'Modem';
}

export interface Sample {
    title: string;
    description: string;
    documentation: string;
    fw: Firmware[];
}

export interface ModemFirmware {
    title: string;
    description: string;
    documentation: string;
    file: string;
}

export interface Samples {
    thingy91: Sample[];
    dk91: Sample[];
    mfw: ModemFirmware[];
}

const SERVER_URL =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/samples';
const DOWNLOAD_FOLDER = join(getAppDataDir(), 'firmware');

const fullPath = (file: string) =>
    join(getAppDir(), 'resources', 'firmware', file);

export const initialSamples: Samples = {
    thingy91: [],

    dk91: [],

    mfw: [],
};

export const readBundledIndex = () =>
    readFile(fullPath('index.json'), {
        encoding: 'utf8',
    }).then(file => JSON.parse(file) as Samples);

export const downloadSampleIndex = () =>
    fetch(`${SERVER_URL}/index.json`, {
        cache: 'no-cache',
    }).then<Samples>(result => result.json());

export const downloadModemFirmware = (modemFirmware: ModemFirmware) =>
    downloadFile(modemFirmware.file);

export const downloadSample = async (sample: Sample) => {
    if (!existsSync(DOWNLOAD_FOLDER)) {
        await mkdir(DOWNLOAD_FOLDER);
    }

    Promise.all(sample.fw.map(fw => downloadFile(fw.file)));
};

export const downloadFile = async (fileName: string) => {
    const targetFile = downloadedFilePath(fileName);
    const url = `${SERVER_URL}/${fileName}`;

    if (existsSync(targetFile)) return;
    logger.info(`Sample not found locally, downloading ${url}`);

    if (existsSync(fullPath(fileName))) {
        logger.info(`Sample is bundled with app, copying.`);
        await copyFile(fullPath(fileName), targetFile);
        return;
    }

    const response = await fetch(url);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    await writeFile(targetFile, Buffer.from(buffer));
};

export const downloadedFilePath = (file: string) => join(DOWNLOAD_FOLDER, file);
