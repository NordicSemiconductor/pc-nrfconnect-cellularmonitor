import { readFile } from 'fs/promises';
import { join } from 'path';
import { TDispatch } from 'pc-nrfconnect-shared/src/state';

import { autoDetectDbRootFolder } from '../../utils/store';
import { setManualDbFilePath } from './traceSlice';

export type Version = {
    database: {
        path: string;
        sha256: string;
    };
    uuid: string;
    version: string;
};

let traceFilesCache: Version[];
export const traceFiles = async () => {
    if (!traceFilesCache) {
        const json = await readFile(
            join(autoDetectDbRootFolder(), 'config.json'),
            {
                encoding: 'utf-8',
            }
        );
        const config = JSON.parse(json);
        traceFilesCache =
            config.firmwares.devices[0].versions.reverse() as Version[];
    }

    return traceFilesCache;
};

export const setSelectedTraceDatabaseFromVersion =
    (version: string) => async (dispatch: TDispatch) => {
        const versions = await traceFiles();
        const selectedVersion = versions.find(v => v.version === version);
        const file = join(
            autoDetectDbRootFolder(),
            selectedVersion?.database.path.replace(`\${root}`, '') ?? ''
        );
        dispatch(setManualDbFilePath(file));
    };
