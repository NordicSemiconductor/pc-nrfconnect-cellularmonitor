/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
// eslint-disable-next-line import/no-unresolved -- Because this is a pure typescript type import which eslint does not understand correctly yet. This can be removed either when we start to use eslint-import-resolver-typescript in shared of expose this type in a better way from nrf-monitor-lib-js
import { InsightInitParameters } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import path from 'path';
import { getAppDataDir, logger } from 'pc-nrfconnect-shared';
import { pathToFileURL } from 'url';

import { autoDetectDbRootFolder } from '../../utils/store';

const BUFFER_SIZE = 1;
const CHUNK_SIZE = 256;

const autoDetectDbCacheDirectory = path.join(getAppDataDir(), 'trace_db_cache');

const autoDetectDbRootURL = pathToFileURL(autoDetectDbRootFolder).toString();

export const sourceConfig = (
    manualDbFilePath: string | undefined,
    useTraceDB: boolean,
    additionalInitParameters: Partial<InsightInitParameters['init_parameters']>
) => {
    const initParameterForTraceDb =
        manualDbFilePath != null
            ? { db_file_path: manualDbFilePath }
            : {
                  auto_detect_db_config: {
                      cache_directory: autoDetectDbCacheDirectory,
                      root: autoDetectDbRootURL,
                      update_cache: true,
                      // eslint-disable-next-line no-template-curly-in-string -- Because this is no template string but the syntax used by nrf-monitor-lib
                      trace_db_locations: ['${root}/config.json'] as unknown[],
                  },
              };

    return {
        name: 'nrfml-insight-source',
        init_parameters: {
            ...additionalInitParameters,
            ...(useTraceDB ? initParameterForTraceDb : {}),
            chunk_size: CHUNK_SIZE,
        },
        config: {
            buffer_size: BUFFER_SIZE,
        },
    } as const;
};

export function detectTraceDB(
    progress: nrfml.Progress,
    detectedTraceDB: unknown
) {
    if (
        progress.meta?.modem_db_path != null &&
        detectedTraceDB !== progress.meta?.modem_db_path
    ) {
        detectedTraceDB = progress.meta?.modem_db_path;
        logger.info(`Using trace DB ${detectedTraceDB}`);
    }
    return detectedTraceDB;
}

export function detectModemFwUuid(
    progress: nrfml.Progress,
    detectedModemFwUuid: unknown
) {
    if (
        progress.meta?.modem_db_uuid != null &&
        detectedModemFwUuid !== progress.meta?.modem_db_uuid
    ) {
        detectedModemFwUuid = progress.meta?.modem_db_uuid;
        logger.info(`Detected modem firmware with UUID ${detectedModemFwUuid}`);
    }
    return detectedModemFwUuid;
}
