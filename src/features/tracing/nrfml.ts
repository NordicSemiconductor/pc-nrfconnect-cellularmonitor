/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    DataSource,
    ModemTraceDecoderOpts,
    PcapSinkOpts,
    RawSinkOpts,
    SerialPortBuilder,
    type StreamPacket,
    type TraceTask,
    TraceTaskBuilder,
    waitForTask,
    WiresharkSinkOpts,
} from '@nordicsemi/nrfml-js';
import {
    type AppThunk,
    describeError,
    deviceInfo,
    logger,
    selectedDevice,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { NrfutilDeviceLib } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';
import { join } from 'path';
import { pathToFileURL } from 'url';

import { displayName } from '../../../package.json';
import type { RootState } from '../../app/appReducer';
import { autoDetectDbRootFolder } from '../../app/store';
import EventAction from '../../app/usageDataActions';
import { raceTimeout } from '../../common/promise';
import {
    getDeviceKeyForTraceDatabaseEntries,
    is9160DK,
} from '../programSample/programSample';
import {
    getShellParser,
    getTerminalSerialPort as getUartSerialPort,
} from '../terminal/serialPortSlice';
import { recommendedAt } from '../tracingEvents/at/recommeneded';
import { detectDatabaseVersion, sendAT } from '../tracingEvents/at/sendCommand';
import { resetDashboardState } from '../tracingEvents/dashboardSlice';
import { defaultSharkPath } from '../wireshark/wireshark';
import { getWiresharkPath } from '../wireshark/wiresharkSlice';
import {
    hasProgress,
    sinkEvent,
    type SourceFormat,
    type TraceFormat,
} from './formats';
import makeProgressCallback from './makeProgressCallback';
import sinkFile from './sinkFile';
import { getSelectedTraceDatabaseFromVersion } from './traceDatabase';
import { notifyListeners, tracePacketEvents } from './tracePacketEvents';
import {
    getManualDbFilePath,
    getRefreshOnStart,
    getResetDevice,
    getTaskAbortHandle,
    getTraceSerialPort,
    setDetectingTraceDb,
    setDetectTraceDbFailed,
    setManualDbFilePath,
    setTraceDataReceived,
    setTraceIsStarted,
    setTraceIsStopped,
    setTraceSourceFilePath,
} from './traceSlice';

let reloadHandler: () => void;

const progressConfigs = (source: SourceFormat, sinks: TraceFormat[]) =>
    sinks.filter(hasProgress).map(format => ({
        format,
        path: sinkFile(source, format),
    }));

const TRACE_DATABASE_CONFIG_FILE = 'config_v3.json';

// Need to figure out what to do with the cache directory
// Files from here aren't added to the cache, and files in the cache are not added to the config file
const getModemDbPath = (state: RootState, source: SourceFormat) => {
    if (source.type === 'device' && source.autoDetectedManualDbFile) {
        return source.autoDetectedManualDbFile;
    }
    const manualDbFilePath = getManualDbFilePath(state);
    if (manualDbFilePath !== undefined) {
        return manualDbFilePath;
    }

    return join(
        pathToFileURL(autoDetectDbRootFolder()).toString(),
        TRACE_DATABASE_CONFIG_FILE,
    );
};

const setupBuilder =
    (
        source: SourceFormat,
        sinks: TraceFormat[],
        onStartTrace: (task: TraceTask) => void | Promise<void>,
        updateChart = false,
        hideDetectingTraceDbMessage = false,
    ): AppThunk<RootState, Promise<void>> =>
    async (dispatch, getState) => {
        const hasSelectedManualDbFile =
            getManualDbFilePath(getState()) !== undefined;
        const builder = new TraceTaskBuilder();

        builder
            .withDataSource(
                source.type === 'file'
                    ? await DataSource.fromFile(source.path)
                    : await DataSource.fromSerialport(
                          new SerialPortBuilder(source.port, 1000000),
                      ),
            )
            .withModemDecoder(
                new ModemTraceDecoderOpts(getModemDbPath(getState(), source)),
            )
            .withProgressCb(
                makeProgressCallback(dispatch, {
                    detectingTraceDb: !hasSelectedManualDbFile,
                    displayDetectingTraceDbMessage:
                        !hasSelectedManualDbFile &&
                        !hideDetectingTraceDbMessage,
                }),
            );

        sinks.forEach(sink => {
            switch (sink) {
                case 'raw': {
                    builder.withRawSink(
                        new RawSinkOpts(sinkFile(source, sink)),
                    );
                    break;
                }
                case 'pcap': {
                    const opts = new PcapSinkOpts()
                        .withApplicationName(displayName)
                        .withOsName(process.platform)
                        .withOutputPath(sinkFile(source, sink));
                    const device = selectedDevice(getState());
                    if (device) {
                        opts.withHwName(
                            `${deviceInfo(device).name ?? 'unknown'} ${device?.devkit?.boardVersion}`,
                        );
                    }
                    builder.withPcapSink(opts);
                    break;
                }
                case 'live': {
                    const opts = new WiresharkSinkOpts()
                        .withWiresharkPath(
                            getWiresharkPath(getState()) ||
                                defaultSharkPath() ||
                                'WIRESHARK NOT FOUND',
                        )
                        .withApplicationName(displayName)
                        .withOsName(process.platform);
                    const device = selectedDevice(getState());
                    if (device) {
                        opts.withHwName(
                            `${deviceInfo(device).name ?? 'unknown'} ${device?.devkit?.boardVersion}`,
                        );
                    }

                    builder.withWiresharkSink(opts);
                    break;
                }
            }
        });

        let cleanup = () => {};
        if (updateChart) {
            const packets: StreamPacket[] = [];
            const throttle = setInterval(() => {
                if (packets.length > 0) {
                    notifyListeners(packets.splice(0, packets.length));
                }
            }, 30);

            builder.withUserDataCb(data => {
                const { dataReceived } = getState().app.trace;
                if (!dataReceived) dispatch(setTraceDataReceived(true));

                if (data.format !== 'modem_trace') {
                    packets.push(data);
                }
            });

            dispatch(setTraceDataReceived(false));
            tracePacketEvents.emit('start-process');
            cleanup = () => {
                clearInterval(throttle);
                notifyListeners(packets.splice(0, packets.length));
            };
        }

        const task = await builder.spawn();
        onStartTrace(task);
        await waitForTask(task).finally(() => cleanup());
    };

export const convertTraceFile =
    (
        path: string,
        setLoading: (loading: boolean) => void = () => {},
    ): AppThunk<RootState, Promise<void>> =>
    async dispatch => {
        telemetry.sendEvent(EventAction.CONVERT_TRACE);
        const sinks = ['live' as TraceFormat];
        const source = { type: 'file', path } as SourceFormat;

        setLoading(true);

        await dispatch(
            setupBuilder(source, ['live'], task => {
                logger.info(`Started converting ${path} to pcap.`);
                dispatch(
                    setTraceIsStarted({
                        taskAbortHandle: task.abortHandle(),
                        progressConfigs: progressConfigs(source, sinks),
                    }),
                );
            }),
        ).catch(err => {
            dispatch(setTraceIsStopped());
            dispatch(setDetectingTraceDb(false));
            setLoading(false);

            logger.error(`Failed conversion to pcap: ${describeError(err)}`);
        });

        logger.info(`Successfully converted ${path} to pcap`);
    };

export const startTrace =
    (formats: TraceFormat[]): AppThunk<RootState, Promise<void>> =>
    async (dispatch, getState) => {
        const uartPort = getUartSerialPort(getState());
        const shellParser = getShellParser(getState());
        const tracePort = getTraceSerialPort(getState());
        const resetDevice = getResetDevice(getState());
        const device = selectedDevice(getState());

        if (!tracePort) {
            logger.error('Select serial port to start tracing');
            return;
        }
        const source: SourceFormat = {
            type: 'device',
            port: tracePort,
            startTime: new Date(),
        };

        if (uartPort && getManualDbFilePath(getState()) === undefined) {
            const version = await raceTimeout(
                detectDatabaseVersion(uartPort, shellParser),
            );

            if (typeof version === 'string') {
                const nrfDeviceVersion =
                    getDeviceKeyForTraceDatabaseEntries(device);

                const autoDetectedTraceDbFile =
                    await getSelectedTraceDatabaseFromVersion(
                        version,
                        nrfDeviceVersion,
                    );
                if (autoDetectedTraceDbFile) {
                    dispatch(setManualDbFilePath(autoDetectedTraceDbFile));
                    logger.info(`Detected trace database version ${version}`);
                    source.autoDetectedManualDbFile = autoDetectedTraceDbFile;
                }
            }
        }

        formats.forEach(format => telemetry.sendEvent(sinkEvent(format)));

        dispatch(resetDashboardState());
        dispatch(setTraceSourceFilePath(null));
        tracePacketEvents.emit('start-process');

        await dispatch(
            setupBuilder(
                { type: 'device', port: tracePort, startTime: new Date() },
                formats,
                async task => {
                    logger.info('Started tracefile');

                    dispatch(
                        setTraceIsStarted({
                            taskAbortHandle: task.abortHandle(),
                            progressConfigs: progressConfigs(source, formats),
                        }),
                    );

                    if (resetDevice && is9160DK(device)) {
                        logger.info(`Reseting device`);
                        if (!device) {
                            throw new Error(
                                'No device selected, unable to reset',
                            );
                        }

                        try {
                            await NrfutilDeviceLib.reset(device);
                        } catch (err) {
                            const abortHandle = task.abortHandle();
                            setTimeout(() => abortHandle?.cancel(), 500);
                            logger.error(err);
                            throw new Error('Unable to reset device');
                        }
                    }

                    if (getRefreshOnStart(getState())) {
                        const timeout = formats.includes('live')
                            ? 10_000
                            : 5_000;

                        logger.info(
                            `Refreshing dashboard in ${timeout / 1000} seconds`,
                        );
                        setTimeout(
                            () => dispatch(sendAT(recommendedAt)),
                            timeout,
                        );
                    }

                    const abortHandle = task.abortHandle();
                    reloadHandler = () => abortHandle?.cancel();
                    window.addEventListener('beforeunload', reloadHandler);
                },
                true,
            ),
        ).catch(err => {
            logger.error(`Error when creating trace: ${describeError(err)}`);
        });

        logger.info('Finished tracefile');

        if (reloadHandler) {
            window.removeEventListener('beforeunload', reloadHandler);
        }

        // stop tracing if Completed callback is called and we are only doing live tracing
        if (formats.length === 1 && formats.includes('live')) {
            dispatch(stopTrace());
        }
    };

export const readRawTrace =
    (
        path: string,
        setLoading: (loading: boolean) => void,
    ): AppThunk<RootState> =>
    async dispatch => {
        setLoading(true);
        dispatch(resetDashboardState());
        dispatch(setTraceSourceFilePath(null));

        await dispatch(
            setupBuilder(
                { type: 'file', path },
                ['live'],
                () => {
                    dispatch(setTraceSourceFilePath(path));
                    logger.info(`Started reading trace from ${path}`);
                },
                true,
                true,
            ),
        ).catch(err => {
            logger.error(
                `Error when reading trace from ${path}: ${describeError(err)}`,
            );

            if (
                describeError(err).includes(
                    'Failed to detect modem trace database',
                )
            ) {
                dispatch(setDetectTraceDbFailed(true));
            }
        });

        logger.info(`Completed reading trace from ${path}`);
        setLoading(false);
        setTimeout(() => tracePacketEvents.emit('stop-process'), 1000);
    };

export const stopTrace = (): AppThunk<RootState> => (dispatch, getState) => {
    const taskAbortHandle = getTaskAbortHandle(getState());
    if (taskAbortHandle === null) return;
    taskAbortHandle?.cancel();
    telemetry.sendEvent(EventAction.STOP_TRACE);
    dispatch(setTraceIsStopped());
    tracePacketEvents.emit('stop-process');
};
