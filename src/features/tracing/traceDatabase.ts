/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync } from 'fs';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { logger } from 'pc-nrfconnect-shared';
import { TDispatch } from 'pc-nrfconnect-shared/src/state';
import {
    getAppDataDir,
    getAppDir,
} from 'pc-nrfconnect-shared/src/utils/appDirs';

import {
    autoDetectDbRootFolder,
    storeManualDbFilePath,
} from '../../utils/store';
import { setManualDbFilePath } from './traceSlice';

interface TraceConfig {
    firmwares: {
        updated_timestamp: string;
        devices: {
            type: string;
            databases: Database[];
        }[];
    };
}

export type Database = {
    path: string;
    sha256: string;
    uuid: string;
    version: string;
};

const SERVER_URL =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/trace-db';

// Fallback value added in order to make tests pass.
// If fallback value, trace files will end up in pc-nrfconnect-launcher
const DOWNLOAD_FOLDER = join(getAppDataDir() ?? '', 'traceDB');

let databasesCache: Database[];
export const getDatabases = async () => {
    if (!databasesCache) {
        const json = await readFile(
            join(autoDetectDbRootFolder(), 'config.json'),
            {
                encoding: 'utf-8',
            }
        );
        const config = JSON.parse(json);
        databasesCache =
            config.firmwares.devices[0].databases.reverse() as Database[];
    }

    return databasesCache;
};

export const getSelectedTraceDatabaseFromVersion = async (version: string) => {
    const versions = await getDatabases();
    const selectedVersion = versions.find(v => v.version === version);
    const file = join(
        autoDetectDbRootFolder(),
        selectedVersion?.path.replace(`\${root}`, '') ?? ''
    );
    return file;
};

export const setSelectedTraceDatabaseFromVersion =
    (version: string) => async (dispatch: TDispatch) => {
        const manualDbFile = await getSelectedTraceDatabaseFromVersion(version);
        storeManualDbFilePath(manualDbFile);

        dispatch(setManualDbFilePath(manualDbFile));
    };

export const downloadTraceDatabaseConfig = () =>
    fetch(`${SERVER_URL}/config.json`, {
        cache: 'no-cache',
    })
        .then(async result => {
            let config: undefined | TraceConfig;
            try {
                config = (await result.json()) as TraceConfig;
            } catch (err) {
                logger.error(`Could not parse config.json: ${err}`);
                return [];
            }

            if (!config) return [];

            await downloadAll(config);
            return config.firmwares.devices[0].databases;
        })
        .catch(err => {
            logger.error(
                'Could not update trace databases, because internet request failed. Please check your internet connection, or feel free to ignore this error message.',
                err
            );
            return databasesCache;
        });

const downloadAll = async (config: TraceConfig) => {
    await prepareTargetDirectory();

    const databases =
        config.firmwares.devices[0].databases.reverse() as Database[];

    return Promise.all(databases.map(db => downloadTraceDatabases(db.path)));
};
const downloadTraceDatabases = async (fileName: string) => {
    fileName = fileName.replace(/\${root}/, '');
    const targetFile = join(DOWNLOAD_FOLDER, fileName);
    const url = `${SERVER_URL}/${fileName}`;

    if (existsSync(targetFile)) {
        logger.debug(`Trace database already downloaded: ${fileName}`);
        return;
    }

    if (existsSync(fullPath(fileName))) {
        logger.debug(
            `Trace database ${fileName} was bundled, but has not yet been copied to ${DOWNLOAD_FOLDER}`
        );
        try {
            await copyFile(fullPath(fileName), targetFile);
        } catch (err) {
            logger.error(`Could not copy trace database: ${err}`);
        }
        return;
    }

    logger.info(`Downloading trace database: ${fileName}`);
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        await writeFile(targetFile, Buffer.from(buffer));
        logger.info(`Download successful: ${targetFile}`);
    } catch (err) {
        logger.error(`Could not download trace database: ${err}`);
    }
};

const fullPath = (file: string) =>
    join(getAppDir(), 'resources', 'traceDB', file);

const prepareTargetDirectory = async () => {
    if (!existsSync(DOWNLOAD_FOLDER)) {
        await mkdir(DOWNLOAD_FOLDER);
        logger.info(`Created directory: ${DOWNLOAD_FOLDER}`);
    }
};
