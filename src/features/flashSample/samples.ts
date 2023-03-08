/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net } from '@electron/remote';
import { existsSync } from 'fs';
import { copyFile, readFile, writeFile } from 'fs/promises';
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

export interface Samples {
    thingy91: Sample[];
    dk91: Sample[];
}

const fullPath = (file: string) =>
    join(getAppDir(), 'resources', 'firmware', file);

export const initialSamples: Samples = {
    thingy91: [],

    dk91: [],
};

export const readBundledIndex = () =>
    readFile(fullPath('index.json'), {
        encoding: 'utf8',
    }).then(file => JSON.parse(file) as Samples);

const SERVER_URL =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/samples';
const DOWNLOAD_FOLDER = getAppDataDir();

export const downloadSampleIndex = fetch(`${SERVER_URL}/index.json`, {
    cache: 'no-cache',
}).then<Samples>(result => result.json());

export const downloadSample = (sample: Sample) =>
    Promise.all(sample.fw.map(fw => downloadFile(fw.file)));

export const downloadFile = async (fileName: string) => {
    const targetFile = downloadedFilePath(fileName);
    const url = `${SERVER_URL}/${fileName}`;

    if (existsSync(targetFile)) return;
    logger.info(`Sample not found locally, downloading ${url}`);

    if (existsSync(fullPath(fileName))) {
        logger.info(`Sample is bundled with app, copying.`);
        await copyFile(fullPath(fileName), targetFile);
    }

    const file = await new Promise<Buffer>((resolve, reject) => {
        const buffer: Buffer[] = [];
        net.request({ url })
            .on('response', response => {
                if (response.statusCode >= 400) {
                    reject(
                        new Error(
                            `Unable to download resource, maybe try to manually download ${url} into ${targetFile}`
                        )
                    );
                }
                response.on('data', data => buffer.push(data));
                response.on('end', () => resolve(Buffer.concat(buffer)));
                response.on('error', reject);
            })
            .on('error', reject)
            .end();
    });

    await writeFile(targetFile, file);
};

export const downloadedFilePath = (file: string) => join(DOWNLOAD_FOLDER, file);
