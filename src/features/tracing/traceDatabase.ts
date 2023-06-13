/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
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
const DOWNLOAD_FOLDER = autoDetectDbRootFolder();

let localDatabasesCache: Database[];
let remoteDatabasesCache: Database[];

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
            config.firmwares.devices[0].databases.reverse() as Database[];
    }

    if (remoteDatabasesCache != null) return remoteDatabasesCache;
    return localDatabasesCache;
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

export const remoteTraceDatabasesSynch = () =>
    remoteDatabasesCache != null
        ? remoteDatabasesCache
        : fetch(`${SERVER_URL}/config.json`, {
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

                  remoteDatabasesCache = config.firmwares.devices[0].databases;
                  return remoteDatabasesCache;
              })
              .catch(err => {
                  logger.error(
                      'Could not update trace databases, because internet request failed. Please check your internet connection, or feel free to ignore this error message.',
                      err
                  );
                  return localDatabasesCache;
              });

const downloadAll = async (config: TraceConfig) => {
    await prepareTargetDirectory();

    const databases =
        config.firmwares.devices[0].databases.reverse() as Database[];

    return Promise.all(databases.map(db => downloadTraceDatabase(db.path)));
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
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        await writeFile(targetFile, Buffer.from(buffer));
        logger.info(`Download successful: ${targetFile}`);
    } catch (err) {
        logger.error(`Could not download trace database: ${err}`);
    }
};

const prepareTargetDirectory = async () => {
    if (!existsSync(DOWNLOAD_FOLDER)) {
        await mkdir(DOWNLOAD_FOLDER);
        logger.info(`Created directory: ${DOWNLOAD_FOLDER}`);
    }
};
