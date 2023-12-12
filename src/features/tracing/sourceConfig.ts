/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// eslint-disable-next-line import/no-unresolved
import { InsightInitParameters } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import { getAppDataDir } from '@nordicsemiconductor/pc-nrfconnect-shared';
import path from 'path';
import { pathToFileURL } from 'url';

import type { RootState } from '../../app/appReducer';
import { autoDetectDbRootFolder } from '../../app/store';
import { SourceFormat } from './formats';
import { getManualDbFilePath } from './traceSlice';

const BUFFER_SIZE = 1;
const CHUNK_SIZE = 256;
const autoDetectDbCacheDirectory = path.join(getAppDataDir(), 'trace_db_cache');

export const TRACE_DATABASE_CONFIG_FILE = 'config_v3.json';

const autoDetectDbRootURL = () =>
    pathToFileURL(autoDetectDbRootFolder()).toString();

const initParameterForTraceDb = (manualDbFilePath?: string) =>
    manualDbFilePath != null
        ? { db_file_path: manualDbFilePath }
        : {
              auto_detect_db_config: {
                  cache_directory: autoDetectDbCacheDirectory,
                  root: autoDetectDbRootURL(),
                  update_cache: true,

                  trace_db_locations: [
                      `\${root}/${TRACE_DATABASE_CONFIG_FILE}`,
                  ],
              },
          };

export default (
    state: RootState,
    source: SourceFormat
): InsightInitParameters => ({
    name: 'nrfml-insight-source',
    init_parameters: {
        ...(source.type === 'file'
            ? { file_path: source.path }
            : { serialport: { path: source.port } }),

        ...initParameterForTraceDb(
            source.type === 'device' && source.autoDetectedManualDbFile
                ? source.autoDetectedManualDbFile
                : getManualDbFilePath(state)
        ),
        chunk_size: CHUNK_SIZE,
    },
    config: {
        buffer_size: BUFFER_SIZE,
    },
});
