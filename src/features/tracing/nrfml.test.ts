/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import { testUtils } from 'pc-nrfconnect-shared/test';

import appReducer from '../../appReducer';
import { getMockStore, mockedDataDir } from '../../utils/testUtils';
import { resetParams as resetPowerEstimationParams } from '../powerEstimation/powerEstimationSlice';
import nrfml from './__mocks__/@nordicsemiconductor/nrf-monitor-lib-js';
import { convertTraceFile, startTrace } from './nrfml';
import sinkConfig from './sinkConfig';
import {
    setDetectingTraceDb,
    setTraceIsStarted,
    setTraceIsStopped,
} from './traceSlice';

const MOCKED_DEFAULT_WIRESHARK_PATH = 'default/path/to/wireshark';

jest.mock('../wireshark/wireshark', () => ({
    defaultSharkPath: () => MOCKED_DEFAULT_WIRESHARK_PATH,
    findTshark: () => 'path/to/tshark',
}));

jest.mock('pc-nrfconnect-shared', () => ({
    ...jest.requireActual('pc-nrfconnect-shared'),
    getAppDataDir: () => mockedDataDir,
    getAppFile: () => mockedDataDir,
}));

const mockStore = getMockStore();

const initialState = {
    app: {
        trace: {
            traceData: [],
            serialPort: 'COM1',
        },
        wireshark: {},
    },
    device: {
        devices: {},
    },
};

const store = mockStore(initialState);

describe('nrfml', () => {
    beforeEach(() => {
        store.clearActions();
    });

    it('should start converting', () => {
        store.dispatch(convertTraceFile('somePath.bin'));
        expect(store.getActions()).toEqual([
            {
                type: setTraceIsStarted.type,
                payload: {
                    taskId: 1,
                    progressConfigs: [
                        {
                            format: 'pcap',
                            path: 'somePath.pcapng',
                        },
                    ],
                },
            },
        ]);
    });

    describe('tracing', () => {
        beforeEach(() => {
            jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(
                '2000-01-01T00:00:00.000Z'
            );
            nrfml.start.mockClear();
        });

        it('should start tracing to pcap', () => {
            store.dispatch(startTrace(['pcap']));
            expect(store.getActions()).toEqual([
                { type: resetPowerEstimationParams.type, payload: undefined },
                { type: setDetectingTraceDb.type, payload: true },
                {
                    type: setTraceIsStarted.type,
                    payload: {
                        taskId: 1,
                        progressConfigs: [
                            {
                                format: 'pcap',
                                path: path.join(
                                    mockedDataDir,
                                    'trace-2000-01-01T00-00-00.000Z.pcapng'
                                ),
                            },
                        ],
                    },
                },
            ]);
        });

        it('should start tracing to raw binary', () => {
            store.dispatch(startTrace(['raw']));
            expect(store.getActions()).toEqual([
                { type: resetPowerEstimationParams.type, payload: undefined },
                {
                    type: setTraceIsStarted.type,
                    payload: {
                        taskId: 1,
                        progressConfigs: [
                            {
                                format: 'raw',
                                path: path.join(
                                    mockedDataDir,
                                    'trace-2000-01-01T00-00-00.000Z.bin'
                                ),
                            },
                        ],
                    },
                },
            ]);
        });

        it('does not create a progress config for live traces', () => {
            store.dispatch(startTrace(['raw', 'live']));
            expect(store.getActions()).toEqual([
                { type: resetPowerEstimationParams.type, payload: undefined },
                { type: setDetectingTraceDb.type, payload: true },
                {
                    type: setTraceIsStarted.type,
                    payload: {
                        taskId: 1,
                        progressConfigs: [
                            {
                                format: 'raw',
                                path: path.join(
                                    mockedDataDir,
                                    'trace-2000-01-01T00-00-00.000Z.bin'
                                ),
                            },
                        ],
                    },
                },
            ]);
        });

        it('does not create a progress config for live traces', () => {
            store.dispatch(startTrace(['live']));
            expect(store.getActions()).toEqual([
                { type: resetPowerEstimationParams.type, payload: undefined },
                { type: setDetectingTraceDb.type, payload: true },
                {
                    type: setTraceIsStarted.type,
                    payload: {
                        taskId: 1,
                        progressConfigs: [],
                    },
                },
            ]);
        });

        // Used to simulate wireshark beeing closed while live tracing.
        const wiresharkClosedError = {
            error_code: 18,
            message:
                'wireshark process closed or pipe error plugin path: nrfml-wireshark-named-pipe-sink.nrfml',
            origin: 'Error when running nrfml operation worker.',
        };

        it('stop tracing when wireshark is closed with only live tracing', () => {
            store.dispatch(startTrace(['live']));
            const errorHandler = nrfml.start.mock.calls[0][1];
            errorHandler(wiresharkClosedError);
            const lastAction = store.getActions().slice(-1)[0];
            expect(lastAction.type).toBe(setTraceIsStopped.type);
        });

        it('keep tracing when wireshark is closed but pcap is chosen', () => {
            store.dispatch(startTrace(['live', 'pcap']));
            const errorHandler = nrfml.start.mock.calls[0][1];
            errorHandler(wiresharkClosedError);
            const lastAction = store.getActions().slice(-1)[0];
            expect(lastAction.type).toBe(setTraceIsStarted.type);
        });
    });

    describe('sink configuration', () => {
        const state = testUtils.rootReducer(appReducer)(undefined, {
            type: '@INIT',
        });

        beforeAll(() => {
            Object.defineProperty(process, 'platform', { value: 'MockOS' });
        });

        it('should return proper configuration for raw trace', () => {
            const rawConfig = sinkConfig(
                state,
                { type: 'file', path: 'some/path.bin' },
                'raw'
            );
            expect(rawConfig).toEqual({
                name: 'nrfml-raw-file-sink',
                init_parameters: {
                    file_path: path.join('some', 'path.bin'),
                },
            });
        });

        it('should return proper configuration for live trace', () => {
            const liveConfig = sinkConfig(
                state,
                { type: 'file', path: 'some/path.bin' },
                'live'
            );
            expect(liveConfig).toEqual({
                name: 'nrfml-wireshark-named-pipe-sink',
                init_parameters: {
                    application_name: 'Cellular Monitor',
                    hw_name: undefined,
                    os_name: 'MockOS',
                    start_process: MOCKED_DEFAULT_WIRESHARK_PATH,
                },
            });
        });

        it('should return proper configuration for pcap trace', () => {
            const pcapConfig = sinkConfig(
                state,
                { type: 'file', path: 'some/path.bin' },
                'pcap'
            );
            expect(pcapConfig).toEqual({
                name: 'nrfml-pcap-sink',
                init_parameters: {
                    application_name: 'Cellular Monitor',
                    hw_name: undefined,
                    os_name: 'MockOS',
                    file_path: path.join('some', 'path.pcapng'),
                },
            });
        });
    });
});
