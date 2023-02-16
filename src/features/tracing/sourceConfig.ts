/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// eslint-disable-next-line import/no-unresolved
import { InsightInitParameters } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import path from 'path';
import { getAppDataDir } from 'pc-nrfconnect-shared';
import { pathToFileURL } from 'url';

import type { RootState } from '../../appReducer';
import { autoDetectDbRootFolder } from '../../utils/store';
import { SourceFormat } from './formats';
import { getManualDbFilePath } from './traceSlice';

const BUFFER_SIZE = 1;
const CHUNK_SIZE = 256;

const autoDetectDbCacheDirectory = path.join(getAppDataDir(), 'trace_db_cache');

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
                  // eslint-disable-next-line no-template-curly-in-string -- Because this is no template string but the syntax used by nrf-monitor-lib
                  trace_db_locations: ['${root}/config.json'],
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

        ...initParameterForTraceDb(getManualDbFilePath(state)),
        chunk_size: CHUNK_SIZE,
    },
    config: {
        buffer_size: BUFFER_SIZE,
    },
});
