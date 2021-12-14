/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, { getPluginsDir } from '@nordicsemiconductor/nrf-monitor-lib-js';
// eslint-disable-next-line import/no-unresolved
import { Sources } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import { writeFile } from 'fs';
import { join } from 'path';
import { logger, usageData } from 'pc-nrfconnect-shared';

import { RootState } from '../../appReducer';
import { TAction } from '../../thunk';
import EventAction from '../../usageDataActions';
import { getNameAndDirectory } from '../../utils/fileUtils';
import {
    hasProgress,
    requiresTraceDb,
    sinkEvent,
    SourceFormat,
    TraceFormat,
} from './formats';
import makeProgressCallback from './makeProgressCallback';
import sinkConfig from './sinkConfig';
import sinkFile from './sinkFile';
import sourceConfig from './sourceConfig';
import {
    getManualDbFilePath,
    getSerialPort,
    setPowerEstimationData,
    setPowerEstimationFilePath,
    setTraceIsStarted,
    setTraceIsStopped,
} from './traceSlice';

export type TaskId = number;

const nrfmlConfig = (
    state: RootState,
    source: SourceFormat,
    sinks: TraceFormat[]
) => ({
    config: { plugins_directory: getPluginsDir() },
    sources: [sourceConfig(state, source, sinks)] as Sources,
    sinks: sinks.map(format => sinkConfig(state, source, format)),
});

const progressConfigs = (source: SourceFormat, sinks: TraceFormat[]) =>
    sinks.filter(hasProgress).map(format => ({
        format,
        path: sinkFile(source, format),
    }));

export const convertTraceFile =
    (path: string): TAction =>
    (dispatch, getState) => {
        usageData.sendUsageData(EventAction.CONVERT_TRACE);
        const source: SourceFormat = { type: 'file', path };
        const sinks = ['pcap' as TraceFormat];

        const state = getState();
        const isDetectingTraceDb = getManualDbFilePath(state) == null;

        const taskId = nrfml.start(
            nrfmlConfig(state, source, sinks),
            err => {
                if (err?.error_code === 100) {
                    logger.error(
                        'Trace file does not include modem UUID, so trace database version cannot automatically be detected. Please select trace database manually from Advanced Options.'
                    );
                } else if (err != null) {
                    logger.error(`Failed conversion to pcap: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info(`Successfully converted ${path} to pcap`);
                }
                dispatch(setTraceIsStopped());
            },
            makeProgressCallback(dispatch, {
                detectingTraceDb: isDetectingTraceDb,
                displayDetectingTraceDbMessage: false,
                throttleUpdatingProgress: false,
            })
        );
        dispatch(
            setTraceIsStarted({
                taskId,
                progressConfigs: progressConfigs(source, sinks),
            })
        );
    };

export const extractPowerData =
    (path: string): TAction =>
    (dispatch, getState) => {
        usageData.sendUsageData(EventAction.EXTRACT_POWER_DATA);
        const source: SourceFormat = { type: 'file', path };
        const sinks = ['opp' as TraceFormat];

        const state = getState();
        const taskId = nrfml.start(
            nrfmlConfig(state, source, sinks),
            err => {
                if (err != null) {
                    logger.error(
                        `Failed to get power calculator data: ${err.message}`
                    );
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info(
                        `Successfully extracted power calculator data from ${path}`
                    );
                }
                dispatch(setTraceIsStopped());
            },
            () => {},
            () => {},
            jsonData => {
                // @ts-ignore -- wrong typings from nrfml-js
                const powerEstimationData = jsonData[0]?.onlinePowerProfiler;
                if (!powerEstimationData) return;

                dispatch(stopTrace(taskId));
                const [base, filePath] = getNameAndDirectory(path, '.bin');
                const pathToNewFile = join(filePath, `${base}.json`);
                writeFile(
                    pathToNewFile,
                    JSON.stringify(powerEstimationData),
                    () => {
                        logger.info(`Created file ${pathToNewFile}`);
                        dispatch(setPowerEstimationFilePath(pathToNewFile));
                    }
                );
            }
        );
    };

export const startTrace =
    (sinks: TraceFormat[]): TAction =>
    (dispatch, getState) => {
        const state = getState();
        const port = getSerialPort(state);
        if (!port) {
            logger.error('Select serial port to start tracing');
            return;
        }
        const source: SourceFormat = {
            type: 'device',
            port,
            startTime: new Date(),
        };

        // we want to do use tshark/opp sinks in the background of every trace
        const sinksWithOpp = ['opp', ...sinks] as TraceFormat[];
        sinksWithOpp.forEach(format => {
            usageData.sendUsageData(sinkEvent(format));
        });

        const isDetectingTraceDb =
            getManualDbFilePath(state) == null && requiresTraceDb(sinksWithOpp);

        const taskId = nrfml.start(
            nrfmlConfig(state, source, sinksWithOpp),
            err => {
                if (err != null) {
                    logger.error(`Error when creating trace: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info('Finished tracefile');
                }
                // stop tracing if Completed callback is called and we are only doing live tracing
                if (sinks.length === 1 && sinks[0] === 'live') {
                    dispatch(stopTrace(taskId));
                }
            },
            makeProgressCallback(dispatch, {
                detectingTraceDb: isDetectingTraceDb,
                displayDetectingTraceDbMessage: isDetectingTraceDb,
                throttleUpdatingProgress: true,
            }),
            () => {},
            jsonData => {
                // @ts-ignore -- wrong typings from nrfml-js
                const powerEstimationData = jsonData[0]?.onlinePowerProfiler;
                dispatch(setPowerEstimationData(powerEstimationData));
            }
        );
        logger.info('Started tracefile');
        dispatch(
            setTraceIsStarted({
                taskId,
                progressConfigs: progressConfigs(source, sinks),
            })
        );
    };

export const stopTrace =
    (taskId: TaskId | null): TAction =>
    dispatch => {
        if (taskId === null) return;
        nrfml.stop(taskId);
        usageData.sendUsageData(EventAction.STOP_TRACE);
        dispatch(setTraceIsStopped());
    };
