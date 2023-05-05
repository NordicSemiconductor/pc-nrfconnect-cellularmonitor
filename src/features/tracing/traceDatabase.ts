/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { TDispatch } from 'pc-nrfconnect-shared/src/state';

import { autoDetectDbRootFolder } from '../../utils/store';
import { setManualDbFilePath } from './traceSlice';

export type Database = {
    path: string;
    sha256: string;
    uuid: string;
    version: string;
};

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
        dispatch(setManualDbFilePath(manualDbFile));
    };
