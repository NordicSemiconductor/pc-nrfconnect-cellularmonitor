/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { deviceControlReset } from '@nordicsemiconductor/nrf-device-lib-js';
import nrfml, { getPluginsDir } from '@nordicsemiconductor/nrf-monitor-lib-js';
import type { Configuration } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import {
    getDeviceLibContext,
    logger,
    selectedDevice,
    usageData,
} from 'pc-nrfconnect-shared';

import type { RootState } from '../../appReducer';
import EventAction from '../../usageDataActions';
import { raceTimeout } from '../../utils/promise';
import type { TAction } from '../../utils/thunk';
import { is91DK } from '../programSample/programSample';
import { detectDatabaseVersion } from '../tracingEvents/at/sendCommand';
import { resetDashboardState } from '../tracingEvents/dashboardSlice';
import { hasProgress, sinkEvent, SourceFormat, TraceFormat } from './formats';
import makeProgressCallback from './makeProgressCallback';
import sinkConfig from './sinkConfig';
import sinkFile from './sinkFile';
import sourceConfig from './sourceConfig';
import { getSelectedTraceDatabaseFromVersion } from './traceDatabase';
import {
    notifyListeners,
    Packet,
    tracePacketEvents,
} from './tracePacketEvents';
import {
    getManualDbFilePath,
    getResetDevice,
    getSerialPort,
    getShellParser,
    getTaskId,
    getUartSerialPort,
    setDetectTraceDbFailed,
    setManualDbFilePath,
    setTraceDataReceived,
    setTraceIsStarted,
    setTraceIsStopped,
    setTraceSourceFilePath,
} from './traceSlice';

export type TaskId = bigint;
let reloadHandler: () => void;

const nrfmlConfig = (
    state: RootState,
    source: SourceFormat,
    sinks: TraceFormat[]
): Configuration => ({
    config: { plugins_directory: getPluginsDir() },
    sources: [sourceConfig(state, source)],
    sinks: sinks.map(format => sinkConfig(state, source, format)),
});

const progressConfigs = (source: SourceFormat, sinks: TraceFormat[]) =>
    sinks.filter(hasProgress).map(format => ({
        format,
        path: sinkFile(source, format),
    }));

export const convertTraceFile =
    (
        path: string,
        setLoading: (loading: boolean) => void = () => {}
    ): TAction =>
    (dispatch, getState) => {
        usageData.sendUsageData(EventAction.CONVERT_TRACE);
        const source: SourceFormat = { type: 'file', path };
        const sinks = ['live' as TraceFormat];

        const state = getState();
        const isDetectingTraceDb = getManualDbFilePath(state) == null;

        setLoading(true);
        return new Promise<void>((resolve, reject) => {
            const taskId = nrfml.start(
                nrfmlConfig(state, source, sinks),
                err => {
                    dispatch(setTraceIsStopped());
                    setLoading(false);

                    if (err?.error_code === 100) {
                        logger.error(
                            'Trace file does not include modem UUID, so trace database version cannot automatically be detected. Please select trace database manually from Advanced Options.'
                        );
                    } else if (err != null) {
                        logger.error(
                            `Failed conversion to pcap: ${err.message}`
                        );
                        logger.debug(`Full error: ${JSON.stringify(err)}`);
                    } else {
                        logger.info(`Successfully converted ${path} to pcap`);
                        return resolve();
                    }
                    return reject();
                },
                makeProgressCallback(dispatch, {
                    detectingTraceDb: isDetectingTraceDb,
                    displayDetectingTraceDbMessage: false,
                }),
                () => {}
            );

            logger.info(`Started converting ${path} to pcap.`);
            dispatch(
                setTraceIsStarted({
                    taskId,
                    progressConfigs: progressConfigs(source, sinks),
                })
            );
        });
    };

export const startTrace =
    (formats: TraceFormat[]): TAction =>
    async (dispatch, getState) => {
        const state = getState();
        const uartPort = getUartSerialPort(state);
        const shellParser = getShellParser(state);
        const tracePort = getSerialPort(state);
        const resetDevice = getResetDevice(state);

        if (!tracePort) {
            logger.error('Select serial port to start tracing');
            return;
        }
        const source: SourceFormat = {
            type: 'device',
            port: tracePort,
            startTime: new Date(),
        };

        let isDetectingTraceDb = getManualDbFilePath(state) == null;

        if (uartPort && isDetectingTraceDb) {
            const version = await raceTimeout(
                detectDatabaseVersion(uartPort, shellParser)
            );

            if (typeof version === 'string') {
                const autoDetectedTraceDbFile =
                    await getSelectedTraceDatabaseFromVersion(version);
                if (autoDetectedTraceDbFile) {
                    isDetectingTraceDb = false;
                    dispatch(setManualDbFilePath(autoDetectedTraceDbFile));
                    logger.info(`Detected trace database version ${version}`);
                    source.autoDetectedManualDbFile = autoDetectedTraceDbFile;
                }
            }
        }

        formats.forEach(format => usageData.sendUsageData(sinkEvent(format)));

        const packets: Packet[] = [];
        const throttle = setInterval(() => {
            if (packets.length > 0) {
                notifyListeners(packets.splice(0, packets.length));
            }
        }, 30);

        dispatch(resetDashboardState());
        dispatch(setTraceSourceFilePath(null));
        dispatch(setTraceDataReceived(false));
        tracePacketEvents.emit('start-process');
        const taskId = nrfml.start(
            nrfmlConfig(state, source, formats),
            err => {
                clearInterval(throttle);
                notifyListeners(packets.splice(0, packets.length));
                if (err?.message.includes('tshark')) {
                    logger.logError('Error while tracing', err);
                } else if (err != null) {
                    logger.error(`Error when creating trace: ${err.message}`);
                    logger.debug(`Full error: ${JSON.stringify(err)}`);
                } else {
                    logger.info('Finished tracefile');
                }

                if (reloadHandler) {
                    window.removeEventListener('beforeunload', reloadHandler);
                }

                // stop tracing if Completed callback is called and we are only doing live tracing
                if (formats.length === 1 && formats.includes('live')) {
                    dispatch(stopTrace());
                }
            },
            makeProgressCallback(dispatch, {
                detectingTraceDb: isDetectingTraceDb,
                displayDetectingTraceDbMessage: isDetectingTraceDb,
            }),
            data => {
                const { dataReceived } = getState().app.trace;
                if (!dataReceived) dispatch(setTraceDataReceived(true));

                if (data.format !== 'modem_trace') {
                    // @ts-expect-error  -- Monitor lib has wrong type, needs to be changed.
                    packets.push(data as Packet);
                }
            }
        );

        logger.info('Started tracefile');

        dispatch(
            setTraceIsStarted({
                taskId,
                progressConfigs: progressConfigs(source, formats),
            })
        );

        const device = selectedDevice(state);
        if (resetDevice && is91DK(device)) {
            logger.info(`Reseting device`);
            if (!device) {
                throw new Error('No device selected, unable to reset');
            }

            try {
                await deviceControlReset(getDeviceLibContext(), device.id);
            } catch (err) {
                setTimeout(() => nrfml.stop(taskId), 500);
                logger.error(err);
                throw new Error('Unable to reset device');
            }
        }

        reloadHandler = () => nrfml.stop(taskId);
        window.addEventListener('beforeunload', reloadHandler);
    };

export const readRawTrace =
    (sourceFile: string, setLoading: (loading: boolean) => void): TAction =>
    (dispatch, getState) => {
        const state = getState();
        const source: SourceFormat = { type: 'file', path: sourceFile };

        const packets: Packet[] = [];
        const throttle = setInterval(() => {
            if (packets.length > 0) {
                notifyListeners(packets.splice(0, packets.length));
            }
        }, 30);
        setLoading(true);
        dispatch(resetDashboardState());
        dispatch(setTraceSourceFilePath(null));
        dispatch(setTraceDataReceived(false));
        tracePacketEvents.emit('start-process');

        nrfml.start(
            nrfmlConfig(state, source, []),
            error => {
                clearInterval(throttle);
                if (error) {
                    logger.error(
                        `Error when reading trace from ${sourceFile}: ${error.message}`
                    );

                    if (error.error_code === 22 || error.error_code === 100) {
                        dispatch(setDetectTraceDbFailed(true));
                    }
                } else {
                    logger.info(`Completed reading trace from ${sourceFile}`);
                }
                setLoading(false);
                setTimeout(() => tracePacketEvents.emit('stop-process'), 1000);
            },
            () => {},
            data => {
                const { dataReceived } = getState().app.trace;
                if (!dataReceived) dispatch(setTraceDataReceived(true));

                if (data.format !== 'modem_trace') {
                    // @ts-expect-error  -- Monitor lib has wrong type, needs to be changed.
                    packets.push(data as Packet);
                }
            }
        );
        dispatch(setTraceSourceFilePath(sourceFile));
        logger.info(`Started reading trace from ${sourceFile}`);
    };

export const stopTrace = (): TAction => (dispatch, getState) => {
    const taskId = getTaskId(getState());
    if (taskId === null) return;
    nrfml.stop(taskId);
    usageData.sendUsageData(EventAction.STOP_TRACE);
    dispatch(setTraceIsStopped());
    tracePacketEvents.emit('stop-process');
};
