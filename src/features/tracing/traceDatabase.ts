/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getAppDataDir,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import {
    autoDetectDbRootFolder,
    storeManualDbFilePath,
} from '../../utils/store';
import { TDispatch } from '../../utils/thunk';
import { SupportedDeviceVersion } from '../programSample/programSample';
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
const DOWNLOAD_FOLDER = join(getAppDataDir(), 'trace-db');
const INITIAL_SOURCE_FOLDER = autoDetectDbRootFolder();

let cachedForDevice: SupportedDeviceVersion;
let localDatabasesCache: undefined | DatabaseVersion[];
let remoteDatabasesCache: undefined | DatabaseVersion[];

export const getDatabases = async (
    nrfDeviceVersion: SupportedDeviceVersion
) => {
    prepareTargetDirectory();

    if (nrfDeviceVersion !== cachedForDevice) {
        localDatabasesCache = undefined;
        remoteDatabasesCache = undefined;
    }

    if (!localDatabasesCache) {
        const json = await readFile(
            join(autoDetectDbRootFolder(), 'config_v2.json'),
            {
                encoding: 'utf-8',
            }
        );
        const config = JSON.parse(json) as TraceConfig;
        localDatabasesCache = extractDatabaseVersionsTraceConfig(
            config,
            nrfDeviceVersion
        );
    }

    cachedForDevice = nrfDeviceVersion;
    return remoteDatabasesCache ?? localDatabasesCache;
};

export const getSelectedTraceDatabaseFromVersion = async (
    version: string,
    nrfDeviceVersion: SupportedDeviceVersion
) => {
    const versions = await getDatabases(nrfDeviceVersion);
    const selectedVersion = versions.find(v => v.version === version);
    const file = join(
        autoDetectDbRootFolder(),
        selectedVersion?.database?.path.replace(`\${root}`, '') ?? ''
    );
    return file;
};

export const setSelectedTraceDatabaseFromVersion =
    (version: string, nrfDeviceVersion: SupportedDeviceVersion) =>
    async (dispatch: TDispatch) => {
        const manualDbFile = await getSelectedTraceDatabaseFromVersion(
            version,
            nrfDeviceVersion
        );
        storeManualDbFilePath(manualDbFile);

        dispatch(setManualDbFilePath(manualDbFile));
    };

export const getRemoteDatabases = (nrfDeviceVersion: SupportedDeviceVersion) =>
    remoteDatabasesCache ?? downloadRemote(nrfDeviceVersion);

const downloadRemote = async (nrfDeviceVersion: SupportedDeviceVersion) => {
    let response: Response;
    try {
        response = await fetch(`${SERVER_URL}/config_v2.json`, {
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
        await writeFile(
            join(DOWNLOAD_FOLDER, 'config_v2.json'),
            writableConfig
        );
    } catch (err) {
        logger.debug(
            'traceDatabase: Could not persist remote config.json',
            err
        );
    }

    remoteDatabasesCache = extractDatabaseVersionsTraceConfig(
        config,
        nrfDeviceVersion
    );
    await downloadAll(remoteDatabasesCache);

    return remoteDatabasesCache;
};

const downloadAll = (databases: DatabaseVersion[]) =>
    Promise.all(databases.map(db => downloadTraceDatabase(db.database.path)));
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

        try {
            readdirSync(INITIAL_SOURCE_FOLDER).forEach(file => {
                copyFileSync(
                    join(INITIAL_SOURCE_FOLDER, file),
                    join(DOWNLOAD_FOLDER, file)
                );
            });
            logger.debug(
                `Copied ${INITIAL_SOURCE_FOLDER} to ${DOWNLOAD_FOLDER}`
            );
        } catch (err) {
            logger.error(
                `traceDatabase: Could not copy ${INITIAL_SOURCE_FOLDER} to ${DOWNLOAD_FOLDER}`,
                err
            );
        }
    }
};

const extractDatabaseVersionsTraceConfig = (
    config: TraceConfig,
    nrfDeviceVersion: SupportedDeviceVersion
) =>
    config.firmwares.devices
        .filter(
            device =>
                nrfDeviceVersion === undefined ||
                device.type === nrfDeviceVersion
        )
        .flatMap(device => device.versions);
