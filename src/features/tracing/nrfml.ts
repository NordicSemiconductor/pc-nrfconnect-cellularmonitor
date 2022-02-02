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
    resetParams as resetPowerEstimationParams,
    setData as setPowerEstimationData,
    setFilePath as setPowerEstimationFilePath,
} from '../powerEstimation/powerEstimationSlice';
import { findTshark } from '../wireshark/wireshark';
import { getTsharkPath } from '../wireshark/wiresharkSlice';
import { hasProgress, sinkEvent, SourceFormat, TraceFormat } from './formats';
import makeProgressCallback from './makeProgressCallback';
import sinkConfig from './sinkConfig';
import sinkFile from './sinkFile';
import sourceConfig from './sourceConfig';
import {
    getManualDbFilePath,
    getSerialPort,
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
    sources: [sourceConfig(state, source)] as Sources,
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
        let gotPowerEstimationData = false;
        dispatch(resetPowerEstimationParams());
        logger.info(
            `Attempting to extract power estimation data from file ${path}`
        );
        usageData.sendUsageData(EventAction.EXTRACT_POWER_DATA);
        const source: SourceFormat = { type: 'file', path };
        const sinks = ['opp' as TraceFormat];

        const state = getState();
        const taskId = nrfml.start(
            nrfmlConfig(state, source, sinks),
            err => {
                if (!gotPowerEstimationData) {
                    logger.error(
                        'Failed to get power estimation data, file may not contain requisite data'
                    );
                } else if (err != null) {
                    logger.error(
                        `Failed to get power estimation data: ${err.message}`
                    );
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info(
                        `Successfully extracted power estimation data from ${path}`
                    );
                }
                dispatch(setTraceIsStopped());
            },
            () => {},
            () => {},
            jsonData => {
                if (gotPowerEstimationData) return;
                // @ts-expect-error -- wrong typings from nrfml-js, key name is defined in sink config
                const powerEstimationData = jsonData[0]?.onlinePowerProfiler;
                if (!powerEstimationData) return;
                gotPowerEstimationData = true;
                dispatch(setPowerEstimationData(powerEstimationData));
                dispatch(stopTrace(taskId));
            }
        );
        dispatch(
            setTraceIsStarted({
                taskId,
                progressConfigs: progressConfigs(source, sinks),
            })
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
        dispatch(resetPowerEstimationParams());

        sinks.forEach(format => {
            usageData.sendUsageData(sinkEvent(format));
        });

        const isDetectingTraceDb =
            getManualDbFilePath(state) == null &&
            !(sinks.length === 1 && sinks[0] === 'raw'); // if we originally only do RAW trace, we do not show dialog

        const selectedTsharkPath = getTsharkPath(getState());
        if (findTshark(selectedTsharkPath)) {
            sinks.push('opp');
        }

        const taskId = nrfml.start(
            nrfmlConfig(state, source, sinks),
            err => {
                if (err !== null && err.message.includes('tshark')) {
                    logger.warn(
                        'tshark not found from path or default installation location, cannot get power estimation parameters.'
                    );
                } else if (err != null) {
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
                // @ts-expect-error -- wrong typings from nrfml-js, key name is defined in sink config
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
