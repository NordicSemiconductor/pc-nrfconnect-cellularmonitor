/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { logger } from 'pc-nrfconnect-shared';
import { TDispatch } from 'pc-nrfconnect-shared/src/state';

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
            versions: DatabaseVersion[];
        }[];
    };
}

export type DatabaseVersion = {
    database: {
        path: string;
        sha256: string;
    };
    uuid: string;
    version: string;
};

const SERVER_URL =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/trace-db';
const DOWNLOAD_FOLDER = autoDetectDbRootFolder();

let localDatabasesCache: DatabaseVersion[];
let remoteDatabasesCache: DatabaseVersion[];

export const getDatabases = async () => {
    if (!localDatabasesCache) {
        const json = await readFile(
            join(autoDetectDbRootFolder(), 'config.json'),
            {
                encoding: 'utf-8',
            }
        );
        const config = JSON.parse(json);
        localDatabasesCache =
            config.firmwares.devices[0].versions.reverse() as DatabaseVersion[];
    }

    return remoteDatabasesCache ?? localDatabasesCache;
};

export const getSelectedTraceDatabaseFromVersion = async (version: string) => {
    const versions = await getDatabases();
    const selectedVersion = versions.find(v => v.version === version);
    const file = join(
        autoDetectDbRootFolder(),
        selectedVersion?.database?.path.replace(`\${root}`, '') ?? ''
    );
    return file;
};

export const setSelectedTraceDatabaseFromVersion =
    (version: string) => async (dispatch: TDispatch) => {
        const manualDbFile = await getSelectedTraceDatabaseFromVersion(version);
        storeManualDbFilePath(manualDbFile);

        dispatch(setManualDbFilePath(manualDbFile));
    };

export const getRemoteDatabases = () =>
    remoteDatabasesCache ?? downloadRemote();

const downloadRemote = async () => {
    let response: Response;
    try {
        response = await fetch(`${SERVER_URL}/config.json`, {
            cache: 'no-cache',
        });
    } catch (err) {
        logger.error(
            'Could not download trace databases. Please check your internet connection or feel free to ignore this error message.',
            err
        );
        return;
    }

    let config: undefined | TraceConfig;
    try {
        config = await response.json();
    } catch (err) {
        logger.error(
            'Could not parse remote trace database configuration file',
            err
        );
        return;
    }

    if (!config) return;

    try {
        const writableConfig = JSON.stringify(config);
        await writeFile(join(DOWNLOAD_FOLDER, 'config.json'), writableConfig);
    } catch (err) {
        logger.debug(
            'traceDatabase: Could not persist remote config.json',
            err
        );
    }

    await downloadAll(config);

    remoteDatabasesCache = config.firmwares.devices[0].versions;
    return remoteDatabasesCache;
};

const downloadAll = (config: TraceConfig) => {
    prepareTargetDirectory();

    const databases = config.firmwares.devices[0].versions.reverse();

    return Promise.all(
        databases.map(db => downloadTraceDatabase(db.database.path))
    );
};
const downloadTraceDatabase = async (fileName: string) => {
    fileName = fileName.replace(/\${root}/, '');
    const targetFile = join(DOWNLOAD_FOLDER, fileName);
    const url = `${SERVER_URL}/${fileName}`;

    if (existsSync(targetFile)) {
        logger.debug(`Trace database already downloaded: ${fileName}`);
        return;
    }

    logger.info(`Downloading trace database: ${fileName}`);
    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        await writeFile(targetFile, Buffer.from(buffer));
        logger.info(`Download successful: ${targetFile}`);
    } catch (err) {
        logger.error(`Could not download trace database: ${err}`);
    }
};

const prepareTargetDirectory = () => {
    if (!existsSync(DOWNLOAD_FOLDER)) {
        mkdirSync(DOWNLOAD_FOLDER);
        logger.info(`Created directory: ${DOWNLOAD_FOLDER}`);
    }
};
